# Pets App

Aplicativo mobile para controle da rotina de pets (MVP + V1).

## Requisitos

- Node 18+
- Expo Go (para rodar no dispositivo)

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

## Qualidade

```bash
npm run lint
npm run format
npm run format:check
```

## Seed do banco local

Para popular o SQLite com dados dummy (1 pet e dados básicos), defina:

```
EXPO_PUBLIC_SEED_DB=true
```

Você pode colocar essa variável em um arquivo `.env` na raiz do projeto.

## Estrutura inicial

```
src/
  app/            # Entry point do app (providers)
  navigation/     # Navegação (tabs, stacks)
  theme/          # Tokens (cores, espaçamentos, tipografia)
  ui/             # Componentes base (AppText, Card, Button, IconButton, Input)
  features/       # Estrutura por feature
    home/
    agenda/
    memories/
    explore/
    profile/
```

## Aliases

- `@/` aponta para `src/`

## Checklist de QA (rápido)

1. Criar pet no onboarding e salvar.
2. Checklist do dia: registrar e usar timer.
3. Agenda: criar lembrete para hoje.
4. Perfil: editar pet, adicionar tutor e vacina.
5. Memórias: criar memória com foto.
6. Explorar: buscar serviços e usar filtros.
7. Configurações: exportar/importar backup e resetar app.
