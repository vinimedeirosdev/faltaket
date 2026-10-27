# Roadmap

Ideias para as próximas versões, mais ou menos em ordem de valor.

## Próximas

- **Semestres**: arquivar o semestre atual e começar um novo sem apagar o histórico
  (campo `semestreId` nas matérias + seletor no topo).
- **Lembrete no dia da aula**: notificação push de manhã ("Hoje tem Anatomia, você
  pode faltar mais 1 vez"). Precisa de Firebase Cloud Messaging + Cloud Function
  agendada (plano Blaze).
- **Recuperar senha**: hoje o login usa e-mail sintético, então não há "esqueci a
  senha". Opções: vincular um e-mail real no Perfil (`updateEmail` + verificação)
  ou login com Google (`linkWithPopup`).
- **Matéria com mais de um dia na semana** (`diaSemana` → `dias: number[]`).

## Depois

- Peso por aula (aula dupla conta 2 faltas).
- Calcular `maxFaltas` automaticamente a partir da carga horária (25%).
- Exportar o histórico em CSV/PDF.
- Widget / atalho do PWA direto para "Faltei hoje".
- Testes de componente (Testing Library) para o card e o formulário, e E2E com Playwright contra os emuladores.

## Feito na v2.0.0

Veja o [CHANGELOG](../CHANGELOG.md).
