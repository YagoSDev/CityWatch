import argparse
from pathlib import Path

from .modelos import CATEGORIAS, STATUS
from .ocorrencias import ServicoOcorrencias
from .validacoes import ValidacaoErro


def mostrar_item(item, prefixo=""):
    print(f"{prefixo}{item.id} | {item.categoria} | {item.bairro} | {item.data} | "
          f"{item.status} | {item.descricao}")


def mostrar_lista(itens):
    if not itens:
        print("Nenhuma ocorrência encontrada.")
    for item in itens:
        mostrar_item(item)


def mostrar_indicadores(relatorio):
    print(f"Total de ocorrências: {relatorio['total']} | Pendências: {relatorio['pendencias']}")
    for chave, titulo in (("por_categoria", "Categorias"), ("por_status", "Status")):
        print(titulo)
        for rotulo, medida in relatorio[chave].items():
            print(f"  {rotulo}: {medida['quantidade']} ({medida['percentual']:.2f}%)")
    matriz = relatorio["matriz"]
    print("Matriz categoria × status")
    print("  Categoria | " + " | ".join(matriz["status"]))
    for categoria, linha in zip(matriz["categorias"], matriz["valores"]):
        print(f"  {categoria} | " + " | ".join(map(str, linha)))

    origem = relatorio["origem"]
    print(f"Origem: {origem['registros_validos']} ocorrências válidas, "
          f"{origem['eventos_historicos']} eventos e {origem['registros_rejeitados']} avisos de importação.")
    for item in origem["duracoes_concluidas"]:
        print(f"  {item['id']}: {item['abertura']} → {item['conclusao']} = {item['dias']} dias")
    if origem["concluidas_sem_historico"]:
        print(f"  Concluídas fora da média por falta de histórico: {origem['concluidas_sem_historico']}")
    media = relatorio["tempo_medio_conclusao_dias"]
    print("Tempo médio sem dados." if media is None else f"Tempo médio de conclusão: {media:.2f} dias.")
    for nome, formula in relatorio["formulas"].items():
        print(f"  {nome}: {formula}")
    print(relatorio["interpretacao"])


def mostrar_avisos(servico):
    avisos = servico.avisos()
    if not avisos:
        print("Nenhuma inconsistência de importação.")
    for aviso in avisos:
        linha = f", linha {aviso['linha']}" if aviso["linha"] is not None else ""
        print(f"{aviso['arquivo']}{linha} ({aviso['id']}): {aviso['erro']}")


def menu(servico):
    erros_esperados = (ValidacaoErro, OSError) + getattr(servico.armazenamento, "erros", ())
    print("CityWatch • Gestão acadêmica de ocorrências")
    if servico.avisos():
        print("Há inconsistências nos CSVs. Consulte a opção 10 para ver a validação.")
    while True:
        print(
            "\n1 Cadastrar | 2 Listar | 3 Buscar por ID | 4 Filtrar\n"
            "5 Atualizar status | 6 Histórico | 7 Fila de triagem\n"
            "8 Indicadores | 9 Agrupar por bairro | 10 Avisos de importação | 0 Sair"
        )
        try:
            escolha = input("Opção: ").strip()
            if escolha == "0":
                return
            elif escolha == "1":
                print("Categorias: " + ", ".join(CATEGORIAS))
                item = servico.cadastrar(input("ID: "), input("Categoria: "), input("Descrição: "),
                                          input("Bairro: "), input("Data AAAA-MM-DD (vazio = hoje): ").strip() or None)
                print("Ocorrência cadastrada.")
                mostrar_item(item)
            elif escolha == "2":
                mostrar_lista(servico.listar())
            elif escolha == "3":
                mostrar_item(servico.buscar(input("ID: ")))
            elif escolha == "4":
                print("Categorias: " + ", ".join(CATEGORIAS))
                print("Status: " + ", ".join(STATUS))
                categoria = input("Categoria (opcional): ").strip() or None
                status = input("Status (opcional): ").strip() or None
                mostrar_lista(servico.listar(categoria, status))
            elif escolha == "5":
                print("Status: " + ", ".join(STATUS))
                item = servico.atualizar_status(input("ID: "), input("Novo status: "),
                                                input("Data da alteração (vazio = hoje): ").strip() or None,
                                                input("Observação: "))
                print("Status atualizado.")
                mostrar_item(item)
            elif escolha == "6":
                eventos = servico.historico(input("ID (vazio = todos): ").strip() or None)
                if not eventos:
                    print("Nenhuma atualização registrada.")
                for item in eventos:
                    print(f"{item.data} | {item.ocorrencia_id} | {item.status_anterior} → "
                          f"{item.status_novo} | {item.observacao}")
            elif escolha == "7":
                fila = servico.fila()
                mostrar_lista(fila)
                if fila and input("Examinar a primeira ocorrência? [s/N]: ").strip().lower() == "s":
                    item = servico.examinar_proxima()
                    if item is not None:
                        print("Ocorrência encaminhada para análise.")
                        mostrar_item(item)
                    else:
                        print("A fila já foi examinada.")
            elif escolha == "8":
                mostrar_indicadores(servico.indicadores())
            elif escolha == "9":
                for bairro, categorias in sorted(servico.por_bairro().items()):
                    print(bairro)
                    for categoria, itens in sorted(categorias.items()):
                        print(f"  {categoria}")
                        for item in itens:
                            mostrar_item(item, "    ")
            elif escolha == "10":
                mostrar_avisos(servico)
            else:
                print("Opção inválida. Escolha um número do menu.")
        except erros_esperados as erro:
            print(f"Erro: {erro}")
        except (EOFError, KeyboardInterrupt):
            print("\nEncerrado.")
            return


def main():
    parser = argparse.ArgumentParser(description="Menu local do CityWatch")
    parser.add_argument("--db", type=Path, help="caminho do banco SQLite local")
    argumentos = parser.parse_args()
    menu(ServicoOcorrencias(argumentos.db))


if __name__ == "__main__":
    main()
