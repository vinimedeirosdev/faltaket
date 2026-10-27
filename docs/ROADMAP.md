# Roadmap

Ideias para as próximas versões, mais ou menos em ordem de valor.

## Próximas

- **Semestres**: arquivar o semestre atual, começar um novo e calcular o **CR/coeficiente**
  com o histórico (campo `semestreId` nas matérias + seletor no topo).
- **Recuperar senha**: hoje o login usa e-mail sintético, então não há "esqueci a
  senha". Opções: vincular um e-mail real no Perfil (`verifyBeforeUpdateEmail`) ou
  login com Google (`linkWithPopup`).
- **Anotações por matéria**: resumos e links (Drive da turma, AVA).
- **Horas complementares**: certificados por categoria, com meta de horas do curso.

## Depois

- **Calendário acadêmico**: feriados e recessos (não contam aula nem geram lembrete).
- **Timer de estudo** (pomodoro) com tempo por matéria.
- **Biblioteca**: empréstimos com data de devolução e lembrete.
- **Compartilhar a grade** com colegas (link só leitura).
- Exportar faltas e notas em CSV/PDF.
- Atalhos do PWA ("Faltei hoje", "Nova prova") direto da tela inicial.
- Testes E2E (Playwright) rodando no CI contra os emuladores.

## Feito

- **v3.0.0**: grade horária com aula dupla, faltas justificadas, notas e médias, agenda,
  exportação `.ics`, lembretes push, logo transparente e tema rosa.
- **v2.1.0**: logo nova e foto de perfil.
- **v2.0.0**: reescrita (Firebase, PWA, visual novo).

Detalhes no [CHANGELOG](../CHANGELOG.md).
