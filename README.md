# Amor em Mechas - Front-end

Aplicação React para solicitação de perucas e acesso aos painéis internos do
Instituto Amor em Mechas. Inclui envio de documentos médicos e revisão pela
equipe autorizada.

## Tecnologias

- React 19 e Vite 8.
- Axios para comunicação com a API e renovação de sessão.
- Lucide React para ícones.
- Oxlint e testes com o executor nativo do Node.js.

## Executar localmente

Pré-requisitos: Node.js 22.12+ ou 24+ e backend disponível.

```powershell
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`.
Se a porta estiver ocupada, o Vite informa outra porta.

Em desenvolvimento, as chamadas para `/api` passam pelo proxy definido em
`vite.config.js`, que encaminha para `http://127.0.0.1:8080` e remove o prefixo
`/api`. O backend deve estar em execução; o front não inicia a API nem o banco.

Para acessar outra API diretamente, defina `VITE_API_URL` em `.env.local`:

```dotenv
VITE_API_URL=https://api.exemplo.com
```

Reinicie o Vite após alterar variáveis de ambiente. No acesso direto, o backend
precisa autorizar a origem do front via CORS. Variáveis `VITE_*` são públicas:
nunca coloque senhas, tokens ou chaves nelas.

## Autenticação

- A Área da equipe usa `POST /auth/login` com usuário e senha.
- Access token e refresh token ficam no `sessionStorage` da aba.
- Requisições autenticadas enviam `Authorization: Bearer <accessToken>`.
- O interceptor tenta renovar a sessão em `/auth/refresh` após um `401`.
	Se a renovação falhar, a sessão é encerrada.
- Somente em desenvolvimento, a tela oferece `demo.atendente` e `admin.dev`,
	usando `/auth/dev-token` com `ROLE_ATENDENTE` e `ROLE_ADMIN`, respectivamente.
	O endpoint precisa estar habilitado no perfil de desenvolvimento do backend
	e não deve ser habilitado em produção.
- A visibilidade da revisão usa o claim JWT `role` e sua validade. A autorização
	efetiva deve ser aplicada pelo backend em todas as rotas.

## Solicitações de peruca (equipe)

A entrada **Solicitações** está no menu de Painel, Pacientes, Madrinhas e
Documentos. Exige sessão da equipe (`ADMIN`, `MEDICO`, `ENFERMEIRO` ou
`ATENDENTE`), com autorização efetiva aplicada pela API.

- A lista consulta `GET /solicitacoes?page=0&size=20&busca=...`, com busca por
  nome/e-mail no banco inteiro, paginação e ordenação dos pedidos mais recentes.
- O botão **i** de cada linha consulta `GET /solicitacoes/{id}` e abre um modal
  com paciente, contato, CPF completo (somente neste detalhe restrito à equipe), endereço, dados familiares/médicos,
  solicitante e kits. Campos ainda não preenchidos são sinalizados.
- O modal usa diálogo nativo: foco contido, fechamento por Escape ou botão e
  retorno do foco à lista. Funciona também em telas pequenas.
- **Concluir solicitação** e **Cancelar solicitação** pedem confirmação antes de
  chamar `PATCH /solicitacoes/{id}/status` com `CONCLUIDA` ou `CANCELADA`.
  Após a resposta, a fila e o total são recarregados, corrigindo a última página
  quando necessário. Falhas e conflitos são exibidos, sem simular sucesso.
- Novos cadastros e registros antigos sem status são ativos, inclusive os que
  aguardam completar o formulário. Anonimizados não aparecem. O encerramento
  não exclui pacientes, não muda status de envio e não permite reabertura.
- Use **Atualizar** para refletir alterações realizadas por outros atendimentos.
- O indicador de status fica verde para solicitações ativas e cinza para
  solicitações inativas (concluídas ou canceladas), na lista e nos detalhes.

O contrato está na tag **Solicitacoes** do Swagger da API.

## Documentos médicos

### Upload e segurança

- Upload multipart em `POST /arquivos`, com campos `arquivo` e `tipo`.
- O cadastro do paciente usa `POST /formulario-solicitacao-peruca`. Como o DTO
	publicado exige `enderecoId`, o endereço e o solicitante são criados pelas
	rotas existentes antes desse cadastro. O ID retornado fica no progresso.
- O relatório é enviado depois do cadastro, com `pacienteId` no multipart.
	Essa associação exige `ADMIN`, `MEDICO` ou `ENFERMEIRO`. O upload avulso sem
	paciente continua disponível, inclusive para a foto do cabelo. A foto enviada
	depois do cadastro não é vinculada automaticamente ao paciente por este fluxo.
- Formatos permitidos: PDF, JPG/JPEG e PNG, até 10 MiB (10 MB exibidos na UI).
- O front verifica extensão, MIME declarado, assinatura inicial, arquivo vazio
	e tamanho, além de gerar um nome seguro antes do envio.
- ZIP, scripts, HTML e demais extensões não fazem parte da lista permitida.
- Essas verificações locais são apenas uma barreira de UX: podem ser contornadas
	por chamadas diretas à API e não comprovam segurança nem legitimidade médica.
- A API limita tamanho e tipos, verifica início/fim do PDF e decodifica imagens.
  Isso não equivale à inspeção completa de PDFs nem a um antivírus. Isolamento
  do processamento e proteção da pré-visualização são camadas adicionais.

### Status e conclusão

| Status | Comportamento |
| --- | --- |
| `PENDENTE` | Arquivo recebido, aguardando validação humana; bloqueia a conclusão. |
| `APROVADO` | Permite usar o laudo nos dados médicos e concluir a solicitação. |
| `REJEITADO` | Exibe a observação de rejeição e permite selecionar novo documento antes do cadastro do paciente. |

O formulário consulta `GET /arquivos/{id}` antes de usar o laudo. Não envia
`/dados-medicos` com documento não aprovado. Uma resposta `409` também bloqueia
o fluxo e informa que a aprovação ainda é necessária.

Enquanto o relatório aguarda validação, o pedido não está concluído. Após a
aprovação, consulte o status e use a ação de verificar e concluir a solicitação.
Os IDs das etapas concluídas são preservados para retomar sem duplicação.

O formulário permanece montado durante a navegação da aba. Dados, arquivos e
progresso ficam somente em memória: recarregar ou fechar a página perde esse
estado. A retomada entre sessões ainda não foi implementada.

### Revisão e acesso

- A área Documentos é restrita a `ADMIN`, `MEDICO` e `ENFERMEIRO`, com ou sem
	prefixo `ROLE_` no claim `role`. Atendentes não veem a entrada nem as ações.
- `GET /arquivos/pendentes-validacao` retorna a fila, como lista ou página com
	campo `content`.
- `PATCH /arquivos/{id}/validacao` recebe `{ decisao, observacao }`.
	A observação é obrigatória para `REJEITADO`.
- A resposta real da revisão atualiza imediatamente a lista e o feedback.
- A equipe autorizada pode visualizar pendentes para realizar a análise humana.
- No formulário, o download é liberado somente para documentos aprovados.
- O conteúdo é obtido em `GET /arquivos/{id}/download`, com autenticação e sem
	URLs públicas permanentes. Erros `403` exibem mensagem de acesso restrito.
- Os metadados usados são `id`, `nome`, `nomeOriginal`, `mimeType`,
	`statusValidacao` e `observacaoValidacao`.

Novos uploads incluem `dataUpload`. A tabela exibe “Não informada pela API”
para arquivos legados sem esse campo. `validadoEm` não é
data de upload e não deve substituí-la.

Arquivos antigos não são revalidados automaticamente pela nova política de
upload. A revisão humana não deve ser confundida com uma inspeção de segurança.

### Revisão exclusivamente humana

A equipe visualiza o laudo e decide entre aprovar e rejeitar. Não há OCR,
comparação automática de campos, reprocessamento nem consultas periódicas
automáticas. Nenhuma instalação de Tesseract é necessária. Use **Atualizar lista**
na revisão e **Verificar e concluir solicitação** no formulário para obter
o estado atual da API.

## Verificação

```powershell
npm test
npm run lint
npm run build
```

Os testes automatizados do front usam transporte simulado e cobrem formatos
inválidos, assinatura incompatível, tamanho, nomes seguros, papéis autorizados,
tokens inválidos/expirados, bloqueio de acesso e retomada após aprovação.
Incluem também cadastro público antes do upload associado, preservação do upload
avulso e manutenção da revisão humana pendente.

Também foram verificados no navegador, com respostas simuladas: upload pendente,
rejeição com observação obrigatória, aprovação e conclusão, pré-visualização de
imagem, tratamento de `403` e apresentação em desktop e celular.

### Histórico de homologação em 10/10/2026

Registro da versão anterior, não uma garantia do backend atual. Na integração,
as rotas de revisão foram implementadas novamente. A validação atual do PDF
verifica apenas início/fim e tamanho: não analisa ações JavaScript ou toda a
estrutura interna. A revisão permanece humana.

- Health check direto e pelo proxy: `200`.
- Login de desenvolvimento `admin.dev`: `200`, com Bearer enviado pelo front.
- Fila de documentos autenticada: `200` e renderização dos itens pendentes.
- Uploads de HTML, HTML/ZIP renomeados como PDF, script, PDF/PNG truncados e PDF
	com ação JavaScript vazia: rejeitados com `415`, sem inclusão na fila.
- PDF válido de uma página: aceito com `200`, consultado e exibido em `PENDENTE`.
- Suíte focada do backend de upload/revisão: 30 testes, sem falhas ou erros.

Esses resultados comprovam apenas os cenários exercitados. O login por senha e
a conclusão completa com a API real não foram homologados. A suíte completa do
backend tinha uma falha reportada em `FilhoServiceTest`; o mock de paciente
desse teste foi corrigido na integração de 09/11/2026.

## Limitações conhecidas

- Retomada do formulário não persiste após recarregamento.
- Arquivos legados podem não ter data de upload.
- A pré-visualização não deve ser considerada um ambiente isolado de segurança.
- Na auditoria de dependências realizada durante a implementação, `npm audit`
	apontou uma vulnerabilidade alta na dependência transitiva `source-map-js`.
	A correção está pendente e deve ser tratada separadamente.

## Build e implantação

`npm run build` gera os arquivos em `dist`. `npm run preview` serve o build
localmente. O proxy em `server.proxy` é destinado ao desenvolvimento; na
implantação, configure um reverse proxy para `/api` ou forneça `VITE_API_URL`
no momento do build e configure CORS no backend.
