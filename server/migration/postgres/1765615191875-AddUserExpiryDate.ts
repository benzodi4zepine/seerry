import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserExpiryDate1765615191875 implements MigrationInterface {
  name = 'AddUserExpiryDate1765615191875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "expiryDate" timestamp with time zone`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "expiryDate"`);
  }
}
