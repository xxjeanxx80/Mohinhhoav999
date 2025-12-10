import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtToUsers1734127200000 implements MigrationInterface {
    name = 'AddDeletedAtToUsers1734127200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    }
}
