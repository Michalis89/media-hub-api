import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1754740145363 implements MigrationInterface {
    name = 'CreateUsersTable1754740145363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_module_access" DROP CONSTRAINT "user_module_access_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" DROP CONSTRAINT "user_media_entry_user_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_media_user_updated"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_media_title_trgm"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_role_check"`);
        await queryRunner.query(`ALTER TABLE "user_module_access" DROP CONSTRAINT "user_module_access_module_check"`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" DROP CONSTRAINT "user_media_entry_media_type_check"`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" DROP CONSTRAINT "user_media_entry_status_check"`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" DROP CONSTRAINT "user_media_entry_user_rating_10_check"`);
        await queryRunner.query(`ALTER TABLE "user_module_access" DROP CONSTRAINT "user_module_access_user_id_module_key"`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" DROP CONSTRAINT "user_media_entry_user_id_media_type_external_provider_exter_key"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "display_name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "surname" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_seen_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "users_email_lower_key"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_lower"`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","email_lower","mediahub","public","users"]);
        await queryRunner.query(`ALTER TABLE "users" ADD "email_lower" text GENERATED ALWAYS AS (lower(email)) STORED NOT NULL`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["mediahub","public","users","GENERATED_COLUMN","email_lower","lower(email)"]);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{ "activeModules": [] }'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c874333e127f29508f4be32f6a" ON "user_module_access" ("user_id", "module") `);
        await queryRunner.query(`CREATE INDEX "IDX_e43dc9a05a4d3a5ce55447ee15" ON "user_media_entry" ("user_id", "updated_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6ec651c4fff9d3257d40a1b36a" ON "user_media_entry" ("user_id", "media_type", "external_provider", "external_id") `);
        await queryRunner.query(`ALTER TABLE "user_module_access" ADD CONSTRAINT "FK_bab0338d23048a50e3ac02d7d5c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" ADD CONSTRAINT "FK_3e0058ee2f69a48b383af8a8cfb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_media_entry" DROP CONSTRAINT "FK_3e0058ee2f69a48b383af8a8cfb"`);
        await queryRunner.query(`ALTER TABLE "user_module_access" DROP CONSTRAINT "FK_bab0338d23048a50e3ac02d7d5c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ec651c4fff9d3257d40a1b36a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e43dc9a05a4d3a5ce55447ee15"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c874333e127f29508f4be32f6a"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "settings" SET DEFAULT '{}'`);
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "database" = $3 AND "schema" = $4 AND "table" = $5`, ["GENERATED_COLUMN","email_lower","mediahub","public","users"]);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_lower"`);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES ($1, $2, $3, $4, $5, $6)`, ["mediahub","public","users","GENERATED_COLUMN","email_lower",""]);
        await queryRunner.query(`ALTER TABLE "users" ADD "email_lower" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "users_email_lower_key" UNIQUE ("email_lower")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_seen_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "surname"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "display_name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" ADD CONSTRAINT "user_media_entry_user_id_media_type_external_provider_exter_key" UNIQUE ("user_id", "media_type", "external_provider", "external_id")`);
        await queryRunner.query(`ALTER TABLE "user_module_access" ADD CONSTRAINT "user_module_access_user_id_module_key" UNIQUE ("user_id", "module")`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" ADD CONSTRAINT "user_media_entry_user_rating_10_check" CHECK (((user_rating_10 IS NULL) OR ((user_rating_10 >= 1.0) AND (user_rating_10 <= 10.0))))`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" ADD CONSTRAINT "user_media_entry_status_check" CHECK ((status = ANY (ARRAY['watching'::text, 'completed'::text, 'on_hold'::text, 'dropped'::text, 'plan_to'::text])))`);
        await queryRunner.query(`ALTER TABLE "user_media_entry" ADD CONSTRAINT "user_media_entry_media_type_check" CHECK ((media_type = ANY (ARRAY['anime'::text, 'movie'::text, 'tv'::text, 'music'::text, 'book'::text, 'game'::text])))`);
        await queryRunner.query(`ALTER TABLE "user_module_access" ADD CONSTRAINT "user_module_access_module_check" CHECK ((module = ANY (ARRAY['anime'::text, 'movie'::text, 'tv'::text, 'music'::text, 'book'::text, 'game'::text])))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "users_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'user'::text])))`);
        await queryRunner.query(`CREATE INDEX "idx_user_media_title_trgm" ON "user_media_entry" ("title") `);
        await queryRunner.query(`CREATE INDEX "idx_user_media_user_updated" ON "user_media_entry" ("user_id", "updated_at") `);
        await queryRunner.query(`ALTER TABLE "user_media_entry" ADD CONSTRAINT "user_media_entry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_module_access" ADD CONSTRAINT "user_module_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
