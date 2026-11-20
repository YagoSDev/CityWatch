# Declaração de uso de inteligência artificial

**Projeto:** CityWatch / Neighborhood Action Dashboard. **Autor:** Yago Souza Araujo, RM 575200.

## Assistência utilizada

O ChatGPT/Codex ajudou a discutir a proposta, implementar código em React Native e criar testes como cadastro, atualização de status e cálculo de indicadores. Também ajudou a revisar a documentação e a preparar os dados simulados.

A ferramenta integrada de geração de imagens produziu ilustrações de eventos e uma prévia conceitual da Home. A preparação do mascote também teve apoio de IA a partir de materiais fornecidos pelo autor. Os inventários e prompts disponíveis estão em [imagens de eventos](../assets/events/README.md) e [mascote](../assets/mascot/animations/README.md). As imagens de eventos são ilustrativas, sem comprovação de acontecimentos reais. Os GIFs solicitados e ainda ausentes não são apresentados como gerados.

## Verificação dos resultados

- Requisitos comparados com a atividade no FIAP ON e com o modelo público da coordenação.
- Entrada acadêmica executada com biblioteca padrão, sem carregar SQLite, FastAPI ou Supabase.
- Amostra inicial conferida: 12 ocorrências válidas, 10 eventos históricos, um registro rejeitado, nove pendências e média de conclusão de 5,33 dias.
- Aplicativo adicional submetido a TypeScript, lint, testes de domínio e inspeção de navegação em simulador iOS. Isso não certifica GPS físico, permissões em todos os aparelhos ou serviços demonstrativos como reais.
- Falhas encontradas foram corrigidas e os checks repetidos quando necessário. Os resultados finais estão em [validacao_entrega.md](validacao_entrega.md).

Essas verificações foram executadas pelo assistente no ambiente do projeto. Não equivalem a afirmar que o autor já explicou pessoalmente cada linha. O autor deve revisar o código, compreender e justificar as estruturas/condições/fórmulas, reproduzir o roteiro e apresentar apenas funcionalidades verificadas.

## Responsabilidade, limites e privacidade

Os CSVs acadêmicos foram inventados, com bairros e ocorrências genéricos. As ferramentas de IA não receberam necessidade de utilizar informações de moradores reais para gerar a amostra. Credenciais, `.env.local`, bancos locais, evidências e estados pessoais ficam fora do pacote publicável. O nome/RM de identificação acadêmica foi informado pelo próprio autor.

Não atribuímos à IA autoria de pesquisa de campo, parceria comercial real, confirmação de evento ou atendimento de órgão público. As sugestões não são adotadas como verdade sem conferência. Referências públicas consultadas são apontadas na documentação pertinente.
