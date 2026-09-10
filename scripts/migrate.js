import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

const USERS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS \`users\` (
  \`tg_id\`        varchar(255) NOT NULL,
  \`display_name\` varchar(255) DEFAULT NULL,
  \`first_name\`   varchar(255) DEFAULT NULL,
  \`last_name\`    varchar(255) DEFAULT NULL,
  \`username\`     varchar(255) DEFAULT NULL,
  \`created_at\`   datetime DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\`   datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`tg_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const TODOS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS \`todos\` (
  \`id\`         int NOT NULL AUTO_INCREMENT,
  \`tg_id\`      varchar(255) NOT NULL,
  \`title\`      varchar(500) NOT NULL,
  \`is_done\`    tinyint(1) DEFAULT 0,
  \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_tg_id\` (\`tg_id\`),
  KEY \`idx_is_done\` (\`is_done\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function migrate() {
  console.log('🔌 Connecting to Aiven MySQL...');
  console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

  try {
    // Create users table
    await pool.query(USERS_TABLE_SQL);
    console.log('✅ Table `users` created (or already exists)');

    const [userCols] = await pool.query('DESCRIBE users');
    console.log('\n📋 users table structure:');
    userCols.forEach(r => {
      console.log(`   ${r.Field.padEnd(15)} ${r.Type.padEnd(25)} ${r.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Create todos table
    await pool.query(TODOS_TABLE_SQL);
    console.log('\n✅ Table `todos` created (or already exists)');

    const [todoCols] = await pool.query('DESCRIBE todos');
    console.log('\n📋 todos table structure:');
    todoCols.forEach(r => {
      console.log(`   ${r.Field.padEnd(15)} ${r.Type.padEnd(25)} ${r.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
