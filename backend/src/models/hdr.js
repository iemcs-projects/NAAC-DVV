import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class hdr extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    criteria_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'criteria_master',
        key: 'criteria_code'
      }
    },
    criteria_master_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'criteria_master',
        key: 'id'
      }
    },
    sub_sub_criteria_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    response: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    score: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    cycle_year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'hdr',
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
        name: "idx_hdr_criteria",
        using: "BTREE",
        fields: [
          { name: "criteria_code" },
          { name: "criteria_master_id" },
        ]
      },
    ]
  });
  }
}
