import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class AddCategoryIdToTransactions1593355516484
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        // nome da coluna que vai estar na tabela de transactions
        columnNames: ['category_id'],
        // nome da coluna que vai estar referenciada na foreignKey
        referencedColumnNames: ['id'],
        // Qual tabela estamos referenciando
        referencedTableName: 'categories',
        name: 'TransactionCategory',
        // atualiza em todas as tabelas
        onUpdate: 'CASCADE',
        // se a tabela for deletada seta ela como nula
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
    await queryRunner.dropColumn('transactions', 'category_id');
  }
}
