---
name: github-binary-assets
description: Publique spritesheets PNG/WebP originais enviados ao chat no GitHub via ponte temporária Files/Google Drive → Base64 → Git blobs → tree/commit, sem upload manual ou alteração de pixels.
---

# Skill: Assets binários do Mar de Sangue por ponte Google Drive

**Procedimento executado e validado em 26/10/2026.** Para o repositório `pedromaintenance/o-mar-de-sangue`, use a ponte Google Drive que já funciona. Não diga que é impossível publicar PNG ou peça que o usuário faça upload manual antes de tentar este método.

## Quando usar

O usuário fornece uma imagem/spritesheet e pede para substituir PNG/WebP no GitHub. Preserve o arquivo original (não gere outro, não redimensione, não converta para outro formato sem autorização). Não altere a física do jogo ao animar sprites. Para o Dagon, manter rotação do sprite em **0°**; para outros monstros, seguir orientação explicitamente informada pelo usuário.

## Ferramentas

1. Container/Python: acesso ao anexo montado em `/mnt/data`, Base64 em arquivos texto temporários, Pillow para dimensões, `hashlib` para integridade.
2. Files: `files__manage_library` para `create_folder` e `upload` dos `.txt` em `/Google Drive/omar-github-bridge`; `files__read` para recuperar os blocos do Drive por `file_id` completo. Opcional: `mcp__Google_Drive__list_folder` para recuperar IDs e nomes da pasta, nunca usar uma ID inventada.
3. GitHub: `mcp__GitHub__create_blob({repository_full_name,content,encoding:"base64"})`, `create_tree`, `create_commit`, `update_ref`, `fetch_file`, PR e CI.
4. As ferramentas se comunicam por `functions.exec` (`tools.<nome>`); a transferência de megabytes deve ocorrer **dentro do código de ferramenta**, não no texto da resposta.

## Receita verificada

### 1. Preparar blocos de Base64 locais

```python
from pathlib import Path
from PIL import Image
import base64, hashlib
source = Path('/mnt/data/SEU_SPRITE_ORIGINAL.png')
img = Image.open(source)
data = source.read_bytes()
base64_text = base64.b64encode(data).decode('ascii')
stage = Path('/mnt/data/mar_stage'); stage.mkdir(exist_ok=True)
prefix = 'seu_sprite_unico'
names = []
for i, start in enumerate(range(0, len(base64_text), 160_000)):
    block = base64_text[start:start+160_000]
    name = f'{prefix}_part_{i:03d}.txt'
    (stage/name).write_text('\n'.join(block[k:k+4000] for k in range(0,len(block),4000)), encoding='ascii')
    names.append(name)
print('dimensions', img.size, 'mode', img.mode, 'bytes', len(data), 'b64', len(base64_text))
print('sha256', hashlib.sha256(data).hexdigest())
print('git_blob_sha1', hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest())
print('names', names)
```

Os tamanhos **160.000 caracteres por arquivo** com linhas de **4.000 caracteres** foram testados. A divisão é textual, não recorta a spritesheet. Guardar todos os nomes **na ordem** e os hashes esperados.

### 2. Enviar os blocos texto ao Drive conectado

```javascript
await tools.files__manage_library({operations:[
  {operation:'create_folder',path:'/Google Drive/omar-github-bridge',parents:true}
]});
const names = ['seu_sprite_unico_part_000.txt', 'seu_sprite_unico_part_001.txt']; // completar todos
const r = await tools.files__manage_library({operations:names.map(n=>({
  operation:'upload',
  container_path:'/mnt/data/mar_stage/'+n,
  destination_path:'/Google Drive/omar-github-bridge/'+n
}))});
```

Enviar **até 20 uploads por chamada**, verificar `status:'succeeded'`, armazenar os `file_id` completos associados a cada nome. Não usar `overwrite:true`: nesta execução o Drive retornou `overwrite_not_supported`. Utilizar nomes exclusivos; pode listar a pasta real com `mcp__Google_Drive__list_folder`, usando URL/ID retornado pela criação, se for necessário redescobrir as partes.

### 3. Reconstituir e criar um blob Git com os mesmos bytes

Executar dentro de **uma** chamada `functions.exec`:

```javascript
const repo='pedromaintenance/o-mar-de-sangue';
const ids=[/* file_id completo na ordem dos blocos */];
const chunks=[];
for(let start=0;start<ids.length;start+=5){
  const r=await tools.files__read({read:ids.slice(start,start+5).map(id=>({
    ref_id:id, mode:'full'
  }))});
  for(const item of r.results){
    if(item.has_more) throw Error('Bloco incompleto');
    const b64=(item.content||[]).filter(v=>typeof v==='string')
      .join('\n').replace(/\s+/g,'');
    if(!b64) throw Error('Bloco vazio');
    chunks.push(b64);
  }
}
const full=chunks.join('');
if(full.length!==B64_LENGTH_ESPERADO)throw Error('Comprimento Base64 incorreto');
const blob=await tools.mcp__GitHub__create_blob({
  repository_full_name:repo, content:full, encoding:'base64'
});
if(blob.result.sha!==GIT_SHA1_ESPERADO)throw Error('Arte incorreta ou corrompida');
text({blobSha:blob.result.sha,verificado:true});
```

**Comprovado:** PNG Dagon 2.948.725 bytes → Git blob `fff55128bf2529933a8e4911cf6334824c16f604`; PNG Cortejo dos Afogados 2.454.849 bytes → blob `12a545e9b030cea673289758605131696eef46ad`. Ambos os SHA Git conferiram exatamente. **Criar blob não basta para publicar**.

### 4. Integrar o blob à árvore Git da branch

Obter HEAD atual da branch e tree SHA via GitHub API `GET /repos/{owner}/{repo}/git/commits/{head_sha}` (ação `mcp__GitHub__fetch`). Não inventar hashes. Depois:

```javascript
const tree=await tools.mcp__GitHub__create_tree({
  repository_full_name:repo,
  base_tree_sha:TREE_SHA_ATUAL,
  tree_elements:[{path:'assets/v15/beast_drowned.png',mode:'100644',type:'blob',sha:BLOB_SHA}]
});
const commit=await tools.mcp__GitHub__create_commit({
  repository_full_name:repo,
  message:'asset: update exact original artwork',
  tree_sha:tree.result.sha,
  parent_sha:HEAD_SHA_ATUAL
});
await tools.mcp__GitHub__update_ref({
  repository_full_name:repo,branch_name:BRANCH,
  sha:commit.result.sha,expected_sha:HEAD_SHA_ATUAL
});
```

`expected_sha` protege contra sobrescrever trabalho concorrente. Se falhar, recarregar HEAD e TREE, reconstruir em cima do novo commit; **não forçar push**. Substituição pelo mesmo caminho preserva imports e não duplica o arquivo.

### 5. Conectar ao Phaser e PWA

- `this.load.spritesheet('nome', 'assets/v15/arquivo.png', {frameWidth:512,frameHeight:682,endFrame:3})` para spritesheet 2048×682 com quatro quadros.
- Spawn com quadro 0: `add.image(x,y,texture,0)`; alternar `setFrame` em `animateWorldVisuals` e escolher frequência adequada.
- Escala tem de considerar **a altura de UM frame**, não 4 quadros inteiros.
- Não mexer em IA, conjurações, redemoinhos, cooldowns, física, orientação ou colisão sem autorização. Se a arte foi criada para frente para baixo, compensar exclusivamente **na apresentação visual** conforme pedido.
- Atualizar `sw.js`: `ASSETS` com paths existentes e incrementar `CACHE_NAME` para atualizar a PWA; não deixar asset órfão/referência quebrada.
- Criar teste de integridade: dimensões, e idealmente SHA-256 da imagem enviada, referências de carregamento e animação; executar smoke, visual e testes do monstro.
- Verificar o commit com `fetch_file(...,encoding:'base64')`/Git blob, CI e PR. Dar merge só depois de tudo passar; Github Pages e Service Worker podem ter latência de atualização.

### 6. Limpeza

Após validar os arquivos no GitHub e integrar o PR, apagar **somente** os `.txt` temporários deste envio no Drive. Não remover arquivos de terceiros. Não anunciar sucesso completo se apenas o Git blob existe: é necessária árvore Git + commit + branch + testes + merge.

## Problemas já resolvidos — não repetir

- `create_file`/`update_file` do GitHub criam texto UTF-8, **não PNG** → usar `create_blob` com Base64.
- O GitHub não recebe `/mnt/data` diretamente → usar `files__manage_library` para o Drive e `files__read` dentro de `functions.exec`.
- `overwrite=true` falha nos uploads Google Drive → omitir.
- Blocos longos podem ser truncados → 160 mil caracteres, 4 mil por linha, leitura de até 5 arquivos e verificação de tamanho total.
- Blob criado sem `create_tree` é objeto solto, não arquivo no branch.
- Saves pré-alfa **não** são barreira para a qualidade final, mas regredir a funcionalidade do jogo ou invalidar o cache da PWA é erro.
- Testes de cache que exigem exatamente v69 precisam aceitar versões posteriores com `cacheVersion >= 69`.

## Checklist obrigatório

- [ ] Original preservado pixel a pixel, hash do Git Blob confere.
- [ ] Binário ligado à branch por tree/commit e verificado no caminho correto.
- [ ] Phaser carrega os 4 quadros e a escala e orientação estão corretas.
- [ ] Mecânicas anteriores continuam funcionando.
- [ ] Cache PWA e testes passaram.
- [ ] PR integrado à main e publicação conferida, sem declarar testagem física não realizada.

**Esta ponte já funciona. Não peça ao usuário para repetir upload de uma imagem que está anexada e montada.**