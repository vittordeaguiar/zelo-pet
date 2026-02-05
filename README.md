# Zelo Pet

App mobile para organizar a rotina do seu pet com checklist diário, agenda, vacinas e memórias. Funciona offline e é simples de usar.

## O que dá para fazer

- Criar e gerenciar vários pets
- Checklist diário com progresso e timers
- Agenda de lembretes (vacina, banho, vet, etc.)
- Carteira de vacinação
- Memórias com foto e texto
- Explorar serviços próximos (com filtros)
- Clima na agenda com insights rápidos

## Stack

- Expo + React Native + TypeScript
- SQLite (offline-first)
- Zustand (estado global)
- Zod (validação)

## Como rodar

```bash
npm install
npm run start
```

Atalhos:

```bash
npm run ios
npm run android
npm run web
```

## Variáveis de ambiente

Crie um `.env` na raiz do projeto se precisar:

```
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=chave_aqui
EXPO_PUBLIC_SEED_DB=true
```

## Estrutura do projeto

```
src/
  app/            # Entry do app (providers)
  navigation/     # Tabs e rotas
  theme/          # Tokens (cores, espaçamentos, tipografia)
  ui/             # Componentes base (AppText, Button, Input, etc.)
  data/           # SQLite, seed, migrations e repos
  features/       # Telas e fluxos por feature
    home/
    agenda/
    memories/
    explore/
    profile/
    onboarding/
```

## Banco local

O app usa SQLite e mantém tudo offline. Para popular com dados de exemplo:

```
EXPO_PUBLIC_SEED_DB=true
```

## Roadmap

- Notificações push
- Sincronização na nuvem
- Compartilhamento com outros tutores
