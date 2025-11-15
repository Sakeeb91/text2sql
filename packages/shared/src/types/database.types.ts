/**
 * Database schema types for the Text-to-SQL application.
 *
 * These types represent the structure of the database tables
 * and are used for type-safe database operations.
 */

/**
 * Customer entity representing a user in the system.
 *
 * @property id - Unique customer identifier (auto-incremented)
 * @property name - Full name of the customer
 * @property email - Email address (unique constraint)
 * @property city - City where the customer is located (optional)
 * @property created_at - Timestamp when the customer record was created
 */
export interface Customer {
  id: number;
  name: string;
  email: string;
  city: string | null;
  created_at: Date;
}

/**
 * Order entity representing a purchase transaction.
 *
 * @property id - Unique order identifier (auto-incremented)
 * @property customer_id - Foreign key reference to customers table
 * @property product_name - Name of the purchased product
 * @property quantity - Number of units ordered
 * @property total_amount - Total order amount (decimal with 2 precision)
 * @property order_date - Timestamp when the order was placed
 */
export interface Order {
  id: number;
  customer_id: number;
  product_name: string;
  quantity: number;
  total_amount: number;
  order_date: Date;
}

/**
 * Database schema metadata for a single table.
 *
 * @property tableName - Name of the database table
 * @property columns - Array of column definitions
 */
export interface TableSchema {
  tableName: string;
  columns: ColumnDefinition[];
}

/**
 * Column definition metadata.
 *
 * @property name - Column name
 * @property type - SQL data type
 * @property nullable - Whether the column accepts NULL values
 * @property primaryKey - Whether this column is part of the primary key
 * @property foreignKey - Foreign key reference if applicable
 */
export interface ColumnDefinition {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}
