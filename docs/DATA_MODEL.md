# Modelo de dados

Fonte da verdade das validações: [`firestore.rules`](https://github.com/vinimedeirosdev/faltaket-server/blob/master/firestore.rules)
(repositório faltaket-server). Os tipos TypeScript equivalentes estão em
[`src/features/materias/model.ts`](../src/features/materias/model.ts) e
[`src/features/auth/api.ts`](../src/features/auth/api.ts).

```
users/{uid}
└─ materias/{materiaId}
```

## `users/{uid}`

`uid` é o id do Firebase Auth. Para usuários migrados, é o mesmo id da v1.

| Campo       | Tipo          | Regras                                                                                    |
| ----------- | ------------- | ----------------------------------------------------------------------------------------- |
| `name`      | string        | 1–40 caracteres. Único campo que o cliente pode alterar depois.                           |
| `username`  | string        | Normalizado (`trim().toLowerCase()`). Definido no cadastro.                               |
| `createdAt` | timestamp     | Definido no cadastro.                                                                     |
| `features`  | map, opcional | `{ termo: boolean }`. **Só o Admin SDK grava**; o cliente não consegue criar nem alterar. |

## `users/{uid}/materias/{materiaId}`

| Campo       | Tipo      | Regras                                                                |
| ----------- | --------- | --------------------------------------------------------------------- |
| `nome`      | string    | 1–40 caracteres                                                       |
| `diaSemana` | int       | 1 = segunda … 7 = domingo                                             |
| `maxFaltas` | int       | 1–99: quantas faltas são permitidas                                   |
| `cor`       | string    | `violet`, `pink`, `rose`, `amber`, `emerald`, `sky`, `indigo`, `teal` |
| `faltas`    | array     | Até 200 itens. Pode ter mais itens que `maxFaltas` (= "estourou").    |
| `createdAt` | timestamp |                                                                       |
| `updatedAt` | timestamp | Atualizado a cada escrita (`serverTimestamp()`)                       |

### Item de `faltas`

| Campo  | Tipo              | Observação                                                                                 |
| ------ | ----------------- | ------------------------------------------------------------------------------------------ |
| `id`   | string            | Gerado no cliente; permite remover uma falta específica                                    |
| `data` | timestamp \| null | `null` = falta migrada da v1, que não guardava datas (aparece como "Antes da atualização") |
| `obs`  | string, opcional  | Até 140 caracteres. Omitido quando vazio, porque o Firestore não aceita `undefined`.       |

## Quem pode o quê

| Operação                                   | Permitida se                                                       |
| ------------------------------------------ | ------------------------------------------------------------------ |
| Ler / apagar `users/{uid}` e suas matérias | `request.auth.uid == uid`                                          |
| Criar `users/{uid}`                        | dono **e** só `name`, `username`, `createdAt` (nada de `features`) |
| Alterar `users/{uid}`                      | dono **e** só o campo `name` muda                                  |
| Criar / alterar matéria                    | dono **e** todos os campos presentes e válidos                     |
| Qualquer outro caminho                     | negado                                                             |

## Como cada tela usa os dados

| Ação                                 | Operação no Firestore                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| Carregar matérias                    | `onSnapshot(users/{uid}/materias)`: 1 assinatura para o app todo               |
| Nova matéria                         | `addDoc` com `faltas: []`                                                      |
| Editar matéria                       | `updateDoc` só de `nome`, `diaSemana`, `maxFaltas`, `cor`: **as faltas ficam** |
| Faltei hoje / registrar no histórico | `updateDoc(faltas: arrayUnion(item))`                                          |
| − / remover do histórico / desfazer  | `updateDoc(faltas: arrayRemove(item))`                                         |
| Excluir matéria                      | `deleteDoc`                                                                    |
| Excluir conta                        | reautentica → apaga matérias (batch) → apaga perfil → apaga usuário do Auth    |

## Comparação com a v1

| v1                                                                 | v2                                                                          |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `users/{id}`: `{ name, user, password }` em texto puro             | Senha no Firebase Auth (hash); perfil sem senha                             |
| `materias/{id}` com `id_user` (top-level, sem proteção)            | `users/{uid}/materias/{id}` (isolado por usuário)                           |
| Subcoleção `faltas` com um doc por _checkbox_ (`active`, `indice`) | `maxFaltas` + array só com as faltas que aconteceram, com data e observação |
| Editar matéria apagava e recriava as faltas                        | Editar não toca nas faltas                                                  |
