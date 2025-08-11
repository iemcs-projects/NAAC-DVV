import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class iqac_supervision extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    uuid: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: "uuid"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "email"
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    institution_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    institution_type: {
      type: DataTypes.ENUM('university','affiliated_pg','affiliated_ug','autonomous'),
      allowNull: false
    },
    aishe_id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: "aishe_id"
    },
    institutional_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "institutional_email"
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'iqac_supervision',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "uuid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uuid" },
        ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "aishe_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "aishe_id" },
        ]
      },
      {
        name: "institutional_email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "institutional_email" },
        ]
      },
    ]
  });
  }
}
