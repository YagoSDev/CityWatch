# Roteiro sugerido para o vídeo do autor

**Autor:** Yago Souza Araujo — RM 575200. O vídeo será gravado e publicado pelo autor como **Não Listado** no YouTube. O tempo abaixo é uma sugestão de organização (cerca de 5–7 minutos), não um limite encontrado no enunciado.

1. **Apresentação (30 s):** identifique autor/RM, CityWatch e o problema de registros dispersos em bairros fictícios. Explique que o núcleo é Python e que nenhum órgão público recebe solicitações nesta simulação.
2. **Execução independente (30 s):** mostre `python src/sistema.py` ou `python3 src/sistema.py`. Explique carga CSV e modo em memória; não precisa ligar app, API, banco, Supabase ou internet.
3. **Dados e inconsistência (40 s):** opção 8 mostra 12 válidas, nove pendências e 5,33 dias. Opção 10 mostra OC-013 rejeitada por descrição vazia. Abra os CSVs para mostrar quatro categorias e 10 eventos históricos.
4. **Consulta/filtro (30 s):** opção 3, ID OC-007; opção 4, categoria limpeza e status em análise. Explique a expressão booleana documentada no README.
5. **Cadastro (40 s):** opção 1; ID DEMO-014; iluminação; “Poste apagado próximo à praça fictícia”; Bairro Norte; 2026-10-20. Mostre o status inicial aberta e busque o novo ID na opção 3.
6. **Status e histórico (40 s):** opção 5; DEMO-014; em análise; 2026-10-21; “Exame comunitário simulado”. Opção 6, DEMO-014. Explique LIFO e a atualização mais recente primeiro.
7. **Erro tratado (20 s):** opção 5; DEMO-014; `resolvida`. O status desconhecido é rejeitado e o menu continua. Não diga que isso foi uma falha inesperada: é uma validação deliberada.
8. **Estruturas (60 s):** mostre `backend/estruturas.py`. Lista percorre ocorrências; dicionário busca por ID; fila ordena não examinadas; pilha lê últimas alterações; hierarquia agrupa bairro/categoria; matriz cruza categoria/status. Opção 7 mostra fila e responda N para não alterar; opção 9 exibe hierarquia.
9. **Indicadores e conclusão (40 s):** opção 8 após o cadastro mostra 13 válidas. Explique a diferença da base inicial. A média de três conclusões simuladas continua 5,33 dias. Mostre fórmula e limitação da amostra.
10. **Fechamento:** explique acessibilidade textual, privacidade, declaração de IA e responsabilidade de compreender o código. O aplicativo pode aparecer brevemente como extensão, sem substituir a demonstração dos requisitos Python. Termine com opção 0.

## Reprodução e evidências

```sh
python3 scripts/demonstracao_academica.py
```

O script executa o menu de verdade com entradas fictícias, verifica respostas esperadas e salva `docs/evidencias/menu-demonstracao.txt`. Não é um vídeo nem simula uma gravação humana. Reproduza as etapas para preparar sua apresentação e confirme a compreensão pessoal das regras.

## Publicação e TXT

No YouTube, escolha **Não Listado**, copie o link e teste em uma janela sem login. Depois forneça o link para completar o README e gerar o TXT com o repositório público e o vídeo. Não enviar uma transcrição ou um placeholder no lugar desses dois links.
