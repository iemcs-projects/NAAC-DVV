import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_4_1_4 extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'criteria_master',
        key: 'id'
      }
    },
    sl_no: {
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
    session: {
      type: DataTypes.DATE,
      allowNull: false
    },
    year: {
      type: DataTypes.DATE,
      allowNull: false
    },
    budget_allocated_infra_aug: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    expenditure_infra_aug: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    total_expenditure_excl_salary: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    expenditure_academic_maint: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    expenditure_physical_maint: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'response_4_1_4',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sl_no" },
        ]
      },
      {
        name: "idx_r414_criteria",
        using: "BTREE",
        fields: [
          { name: "criteria_code" },
          { name: "id" },
        ]
      },
    ]
  });
  }
}
