# Modelo de dados

A fonte da verdade das validações é o [`firestore.rules`](https://github.com/vinimedeirosdev/faltaket-server/blob/main/firestore.rules),
no repositório faltaket-server. Os tipos TypeScript equivalentes estão em:

- [`src/features/materias/model.ts`](../src/features/materias/model.ts): matérias, horários, faltas e notas
- [`src/features/agenda/model.ts`](../src/features/agenda/model.ts): eventos
- [`src/features/auth/api.ts`](../src/features/auth/api.ts): perfil e config

```
users/{uid}
├─ materias/{materiaId}      horários, faltas e notas dentro do doc
├─ eventos/{eventoId}        provas, trabalhos e entregas
└─ dispositivos/{hash}       tokens dos lembretes (push)
```

## `users/{uid}`

O `uid` é o id do Firebase Auth. Para usuários migrados, é o mesmo id da v1.

| Campo       | Tipo             | Regras                                                                                                           |
| ----------- | ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `name`      | string           | 1 a 40 caracteres. O dono pode alterar.                                                                          |
| `username`  | string           | Normalizado (`trim().toLowerCase()`). Definido no cadastro.                                                      |
| `createdAt` | timestamp        | Definido no cadastro.                                                                                            |
| `foto`      | string, opcional | Data URL `data:image/webp;base64,...` (ou jpeg), 256×256, até 150 mil caracteres. O dono pode trocar ou remover. |
| `config`    | map, opcional    | Preferências; ver abaixo. O dono pode alterar.                                                                   |
| `features`  | map, opcional    | `{ termo: boolean }`. **Só o Admin SDK grava.**                                                                  |

### `config`

Todos os campos são opcionais. Quando um campo falta, o app usa o padrão `CONFIG_PADRAO`.

| Campo                           | Tipo                                       | Padrão       | Uso                                                         |
| ------------------------------- | ------------------------------------------ | ------------ | ----------------------------------------------------------- |
| `mediaAprovacao`                | número 0–10                                | 7            | Média para aprovar                                          |
| `mediaExame`                    | número 0–10                                | não tem      | Abaixo da média, mas acima deste valor, vai para exame      |
| `semestreInicio`, `semestreFim` | "AAAA-MM-DD"                               | não tem      | Exportação da agenda (aulas semanais até o fim do semestre) |
| `notificacoes`                  | `{ aulas, provas, entregas, risco: bool }` | todos `true` | Tipos de lembrete                                           |

## `users/{uid}/materias/{materiaId}`

| Campo                    | Tipo                     | Regras                                                                                                  |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `nome`                   | string                   | 1 a 40 caracteres                                                                                       |
| `horarios`               | array (1 a 14)           | `[{ dia: 1–7, inicio?: "HH:MM", fim?: "HH:MM", sala?: string, aulas: 1\|2 }]`. `aulas: 2` = aula dupla. |
| `diaSemana`              | int 1–7, **legado**      | Formato da v2.0. Só existe em matérias que ainda não foram editadas. Ver "Compatibilidade" abaixo.      |
| `maxFaltas`              | int 1–99                 | Faltas permitidas, contadas em aulas                                                                    |
| `cor`                    | string                   | `violet`, `pink`, `rose`, `amber`, `emerald`, `sky`, `indigo`, `teal`                                   |
| `faltas`                 | array (até 200)          | Ver item abaixo. Pode passar de `maxFaltas` (= "estourou").                                             |
| `professor`              | map, opcional            | `{ nome: string ≤60, email?: string ≤100 }`                                                             |
| `notas`                  | array (até 30), opcional | Ver item abaixo                                                                                         |
| `mediaAprovacao`         | número 0–10, opcional    | Sobrescreve a média do perfil só nesta matéria                                                          |
| `createdAt`, `updatedAt` | timestamp                | `updatedAt` muda a cada escrita                                                                         |

**Item de `faltas`**

| Campo         | Tipo              | Observação                                                        |
| ------------- | ----------------- | ----------------------------------------------------------------- |
| `id`          | string            | Gerado no cliente; permite remover uma falta específica           |
| `data`        | timestamp \| null | `null` = falta migrada da v1, sem data ("Antes da atualização")   |
| `obs`         | string, opcional  | Até 140 caracteres                                                |
| `aulas`       | 2, opcional       | Falta em aula dupla; conta 2. Quando o campo falta, vale 1.       |
| `justificada` | true, opcional    | Atestado/abono: aparece no histórico, mas **não conta** no limite |

As faltas que contam no limite são calculadas por `faltasContadas()`: soma `aulas ?? 1` das faltas que **não** estão justificadas.

**Item de `notas`**

| Campo   | Tipo                | Observação                     |
| ------- | ------------------- | ------------------------------ |
| `id`    | string              |                                |
| `nome`  | string ≤20          | "P1", "Trabalho"...            |
| `peso`  | número 0,1–10       |                                |
| `valor` | número 0–10 \| null | `null` = a nota ainda não saiu |

A média ponderada e o "quanto preciso tirar" saem de `calcularNotas()` em [`src/features/notas/calculo.ts`](../src/features/notas/calculo.ts).

### Compatibilidade com a v2.0 (sem migração)

As matérias criadas na v2.0 têm `diaSemana` e não têm `horarios`. Elas continuam funcionando assim:

- **Leitura:** `horariosDe(m)` devolve `m.horarios` ou, se não houver, `[{ dia: m.diaSemana, aulas: 1 }]`.
- **Edição:** ao salvar uma matéria antiga, o front grava `horarios` e **apaga** `diaSemana`. A conversão acontece matéria por matéria, sem script.
- **Rules:** aceitam `horarios` ou `diaSemana`.

## `users/{uid}/eventos/{eventoId}`

| Campo                    | Tipo                  | Regras                                                                  |
| ------------------------ | --------------------- | ----------------------------------------------------------------------- |
| `tipo`                   | string                | `prova`, `trabalho`, `entrega`, `outro`                                 |
| `titulo`                 | string                | 1 a 60 caracteres                                                       |
| `materiaId`              | string, opcional      | Matéria relacionada                                                     |
| `data`                   | timestamp             | Se `temHora` for false, é gravado às 12:00 (não muda de dia com o fuso) |
| `temHora`                | bool                  |                                                                         |
| `local`                  | string ≤60, opcional  |                                                                         |
| `descricao`              | string ≤500, opcional |                                                                         |
| `concluido`              | bool                  |                                                                         |
| `checklist`              | array (até 30)        | `[{ id, texto, feito }]`                                                |
| `createdAt`, `updatedAt` | timestamp             |                                                                         |

## `users/{uid}/dispositivos/{hash}`

Os tokens do Firebase Cloud Messaging, um por aparelho com lembretes ligados. O id do doc é o SHA-256 do token, então o mesmo aparelho não duplica.

| Campo        | Tipo                                                  |
| ------------ | ----------------------------------------------------- |
| `token`      | string                                                |
| `plataforma` | string, opcional: "iPhone", "Android" ou "Computador" |
| `createdAt`  | timestamp                                             |

O script de lembretes apaga os tokens que o FCM informa como inválidos.

## Quem pode o quê

| Operação                                         | Permitida se                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Ler ou apagar qualquer coisa em `users/{uid}/**` | `request.auth.uid == uid`                                               |
| Criar `users/{uid}`                              | é o dono **e** envia só `name`, `username` e `createdAt`                |
| Alterar `users/{uid}`                            | é o dono **e** só mudam `name`, `foto` ou `config`, com valores válidos |
| Criar ou alterar matéria, evento ou dispositivo  | é o dono **e** o doc inteiro é válido                                   |
| Qualquer outro caminho                           | negado                                                                  |

## Como cada tela usa os dados

| Ação                                 | Operação no Firestore                                                                                      |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Carregar matérias e eventos          | Um `onSnapshot` de cada coleção para o app todo (`MateriasProvider`, `EventosProvider`)                    |
| Nova matéria                         | `addDoc` com `horarios` e `faltas: []`                                                                     |
| Editar matéria                       | `updateDoc` de nome, horários, limite, cor e professor; apaga `diaSemana`. **As faltas e as notas ficam.** |
| Faltei hoje / registrar no histórico | `updateDoc(faltas: arrayUnion(item))`                                                                      |
| − / remover / desfazer               | `updateDoc(faltas: arrayRemove(item))`                                                                     |
| Justificar falta                     | `updateDoc(faltas: <lista com o item trocado>)`                                                            |
| Salvar notas                         | `updateDoc(notas: <lista inteira>)`                                                                        |
| Média da matéria                     | `updateDoc(mediaAprovacao)`, ou `deleteField()` para voltar à média do perfil                              |
| Preferências                         | `updateDoc({ 'config.campo': valor })`: muda um campo sem apagar os outros                                 |
| Agenda                               | `addDoc` / `updateDoc` / `deleteDoc` em `eventos`                                                          |
| Ligar lembretes                      | `setDoc(dispositivos/{hash})`                                                                              |
| Excluir conta                        | reautentica → apaga matérias, eventos e dispositivos → apaga perfil → apaga o usuário do Auth              |
