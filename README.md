# Zelo Pet

O Zelo Pet nasceu para resolver um problema simples: a rotina dos pets costuma ficar espalhada entre lembretes, notas soltas e memória.  
Aqui, a ideia foi juntar tudo em um app mobile único, com foco em uso real no dia a dia.

## Visão geral

Aplicativo mobile para tutores organizarem:

- rotina diária (checklist)
- compromissos (agenda)
- saúde (vacinas)
- lembranças (memórias com foto)
- serviços próximos (explorar)

O projeto foi construído com abordagem offline-first: os dados ficam no dispositivo e o app segue funcional mesmo sem internet.

## O que já está pronto

### Onboarding

- fluxo de boas-vindas
- cadastro de tutor
- cadastro do primeiro pet
- suporte a múltiplos pets

### Home (Checklist do dia)

- atividades padrão + atividades personalizadas
- progresso diário
- ações de registrar e timer
- editar, remover e reordenar atividades com drag-and-drop

### Agenda

- calendário mensal
- lembretes por dia
- CRUD de lembretes
- clima com insights (Open-Meteo)

### Perfil

- dados do pet ativo
- gestão de tutores
- carteira de vacinação (CRUD)
- configurações gerais do app

### Memórias

- feed/grid por pet
- criação de memória com texto e foto
- suporte a câmera e galeria
- detalhe da memória

### Explorar (V1)

- busca e categorias
- filtro de raio e ordenação
- localização com fallback
- integração com Google Places (quando chave configurada)

## Stack e arquitetura

- `Expo`
- `React Native`
- `TypeScript`
- `SQLite` (`expo-sqlite`)
- `Zustand` (estado global)
- `Zod` (validação)

Organização principal:

```txt
src/
  app/          # bootstrap, providers, error handling
  navigation/   # tabs e navegação
  data/         # db, migrations, repos, backup/reset
  features/     # módulos por domínio
  ui/           # componentes reutilizáveis
  theme/        # tokens e tema
  state/        # stores globais
```

## Como rodar localmente

Pré-requisitos:

- Node 18+
- npm
- Expo Go (ou simulador iOS/Android)

Instalação:

```bash
npm install
```

Execução:

```bash
npm run start
```

Atalhos:

```bash
npm run ios
npm run android
npm run web
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz se precisar:

```env
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=sua_chave
EXPO_PUBLIC_SEED_DB=true
```

Notas:

- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`: habilita resultados reais na tela Explorar.
- `EXPO_PUBLIC_SEED_DB=true`: popula o banco local com dados de exemplo.

## Banco local

- Banco SQLite local: `zelo-pet.db`
- Migrations aplicadas no bootstrap do app
- Suporte a reset de dados
- Suporte a export/import em JSON (backup local)

## Qualidade e estabilidade

O projeto inclui:

- validações de entrada em camadas críticas
- tratamento de erro de rede com fallback
- boundary de erro para evitar crash total de tela
- logger interno por nível
- testes básicos de fluxos críticos

## Scripts úteis

```bash
npm run lint
npm run format
npm run format:check
npm run test
```

## Próximos passos sugeridos

- finalizar assets oficiais (ícone e splash)
- push notifications (lembretes e vacinas)
- sincronização em nuvem (opcional)
- ampliar cobertura de testes (fluxos completos e cenários de falha)

## Status

MVP concluído e V1 funcional, com foco em experiência de uso, persistência local e base sólida para evolução.
