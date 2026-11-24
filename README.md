# GLÚTEO 21 · Desafio de glúteo em casa (protótipo)

Web app (PWA) do desafio de 21 dias. Next.js (App Router) + TypeScript + Tailwind, pronto pra Vercel.

> **Status: protótipo visual funcional.** Todas as telas funcionam no celular usando `localStorage`
> (modo local). A integração com Firebase está preparada (login por link mágico, webhook da Kiwify,
> regras de segurança), mas **a sincronização de progresso/fotos com Firestore/Storage ainda não foi ligada** —
> veja "Próximos passos".

## Rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 (use o modo celular do DevTools; no desktop o app fica numa coluna de 430px).

### Modo demo
- **http://localhost:3000/?demo=1** → entra direto com uma usuária de exemplo (4 dias feitos, streak, medidas).
- Ou na tela de login: botão **"Testar no modo demo"**.
- Pra fazer o fluxo completo (login → onboarding → treino), entre com **demo@gluteo21.com**.
  Qualquer outro e-mail mostra a tela "Acesso não encontrado".
- No Perfil, "Resetar dados de demo" volta ao estado inicial.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Nome do app, modo de liberação dos dias, descansos, flag do Bônus, WhatsApp | `src/config.ts` |
| **Todo o programa**: 21 dias, fases, treinos A/B/C, biblioteca de exercícios, regras de nível/equipamento | `src/data/program.ts` |
| Vídeos/GIFs dos exercícios | campo `mediaUrl` de cada exercício em `program.ts` (hoje `"placeholder"` → mostra ilustração) |
| Estado do app (progresso, medidas, fotos) | `src/lib/store.ts` |
| Cores e tipografia | `src/app/globals.css` (bloco `@theme`) |

### Regras implementadas
- **Iniciante:** −1 série (mínimo 2) e −20% das reps (arredondado). **Intermediária:** como na tabela.
- **Dias 5/6/7 de cada fase:** +2 reps.
- **Equipamento:** cada exercício tem `variacoes` (`nada`, `band`, `peso`); o app usa a variação do equipamento escolhido quando existe.
- **Liberação dos dias:** `NEXT_PUBLIC_UNLOCK_MODE=sequential` (ao concluir o anterior) ou `calendar` (1 por dia a partir da data de início).
- Todo treino começa com aquecimento de 3 min; o descanso ativo é só mobilidade; o Dia 21 repete o Dia 1 e pede a foto final.

## Telas
`/login` · `/acesso-negado` · `/onboarding` · `/home` (jornada) · `/treino/[dia]` (prévia) · `/treino/[dia]/play` (player) ·
`/treino/[dia]/concluido` · `/progresso` · `/perfil` · `/bonus`

## Firebase

1. Crie um projeto em https://console.firebase.google.com.
2. **Authentication** → Método de login → ative **E-mail/senha** e **Link do e-mail (login sem senha)**.
   Em *Domínios autorizados*, adicione o domínio da Vercel.
3. **Firestore** e **Storage**: crie os bancos e publique as regras de `firebase/firestore.rules` e `firebase/storage.rules`.
4. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_FIREBASE_*` → config do app Web.
   - `FIREBASE_SERVICE_ACCOUNT` → JSON da conta de serviço **em uma linha** (usado pelo webhook e por `/api/access`).

Com as variáveis `NEXT_PUBLIC_FIREBASE_*` definidas, o login passa a consultar `allowedUsers/{email}` e enviar o link mágico.

### Modelo de dados
- `allowedUsers/{email}`: `{ active, purchasedAt, source: "kiwify" }`
- `users/{uid}`: `{ name, email, level, equipment, startDate, reminderTime }`
- `users/{uid}/progress/{day}`: `{ completedAt, feeling, durationSec }`
- `users/{uid}/measurements/{id}`: `{ date, hipCm }`
- Storage: `users/{uid}/photos/day{N}.jpg`

## Webhook da Kiwify

Endpoint: `POST https://SEU-DOMINIO/api/webhooks/kiwify`

1. Na Kiwify: *Apps → Webhooks → Criar*, URL acima, eventos **Compra aprovada**, **Reembolso** e **Chargeback**.
2. Coloque o token gerado lá em `KIWIFY_WEBHOOK_TOKEN`.
3. O endpoint valida o `?signature=` (HMAC-SHA1 do corpo com o token) ou, para testes, `?token=`.
   - aprovado → `allowedUsers/{email}.active = true`
   - reembolso/chargeback → `active = false`

> Confira no painel da Kiwify o formato exato do payload (`order_status`, `webhook_event_type`, `Customer.email`)
> e ajuste os conjuntos `APPROVED`/`REVOKED` em `src/app/api/webhooks/kiwify/route.ts` se necessário.

Teste manual:
```bash
curl -X POST "http://localhost:3000/api/webhooks/kiwify?token=SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_status":"paid","Customer":{"email":"cliente@email.com"}}'
```

## Deploy na Vercel
1. Importe o repositório na Vercel (framework detectado: Next.js).
2. Adicione as variáveis de ambiente do `.env.example`.
3. Deploy. Depois, adicione o domínio em *Authentication → Domínios autorizados* no Firebase e configure o webhook na Kiwify.

## PWA
- Manifest em `src/app/manifest.ts`, ícones em `public/icons/`.
- Service worker simples em `public/sw.js` (só em produção): guarda páginas e estáticos visitados, o que permite abrir o treino do dia offline.

## Próximos passos (fora deste protótipo)
- Trocar as ações de `src/lib/store.ts` por leitura/escrita no Firestore (`users/{uid}/...`) e upload das fotos no Storage.
- Lembrete por **web push** de verdade (hoje o Perfil só pede permissão e salva o horário; o envio agendado precisa de um backend/cron + chaves VAPID).
- Gravar os vídeos/GIFs e preencher `mediaUrl`.
