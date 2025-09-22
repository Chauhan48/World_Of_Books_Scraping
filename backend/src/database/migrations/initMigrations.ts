import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateInitialTables implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // navigation
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS navigation (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      source_url VARCHAR(500),
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      last_scraped_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`);

    // category
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS category (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      source_url VARCHAR(500),
      navigation_id INTEGER REFERENCES navigation(id),
      parent_id INTEGER,
      product_count INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      last_scraped_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`);

    // product
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS product (
      id SERIAL PRIMARY KEY,
      source_id VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(500) NOT NULL,
      author VARCHAR(255),
      price DECIMAL(10,2),
      currency VARCHAR(10) DEFAULT 'USD',
      image_url VARCHAR(1000),
      source_url VARCHAR(1000),
      category_id INTEGER REFERENCES category(id),
      rating_avg DECIMAL(3,2),
      review_count INTEGER DEFAULT 0,
      in_stock BOOLEAN DEFAULT TRUE,
      last_scraped_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`);

    // product_detail
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS product_detail (
      id SERIAL PRIMARY KEY,
      product_id INTEGER UNIQUE REFERENCES product(id),
      description TEXT,
      long_description TEXT,
      specifications JSONB,
      publisher VARCHAR(255),
      publication_date DATE,
      isbn VARCHAR(50),
      isbn13 VARCHAR(50),
      pages INTEGER,
      language VARCHAR(100),
      format VARCHAR(100),
      genres VARCHAR(255),
      additional_images JSONB,
      related_products JSONB,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`);

    // review
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS review (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
      author_name VARCHAR(255),
      author_id VARCHAR(255),
      rating INTEGER,
      title VARCHAR(500),
      content TEXT,
      is_verified BOOLEAN DEFAULT TRUE,
      helpful_count INTEGER DEFAULT 0,
      review_date DATE,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`);

    // scrape_job
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS scrape_job (
      id SERIAL PRIMARY KEY,
      target_url VARCHAR(1000) NOT NULL,
      target_type VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      started_at TIMESTAMP,
      completed_at TIMESTAMP,
      error_message TEXT,
      result JSONB,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )`);

    // view_history
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS view_history (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255),
      session_id VARCHAR(255) NOT NULL,
      path VARCHAR(1000) NOT NULL,
      path_json JSONB,
      referrer VARCHAR(1000),
      user_agent VARCHAR(500),
      ip_address VARCHAR(45),
      metadata JSONB,
      created_at TIMESTAMP DEFAULT now()
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS view_history');
    await queryRunner.query('DROP TABLE IF EXISTS scrape_job');
    await queryRunner.query('DROP TABLE IF EXISTS review');
    await queryRunner.query('DROP TABLE IF EXISTS product_detail');
    await queryRunner.query('DROP TABLE IF EXISTS product');
    await queryRunner.query('DROP TABLE IF EXISTS category');
    await queryRunner.query('DROP TABLE IF EXISTS navigation');
  }
}
