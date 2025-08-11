import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_3_1_1 extends Model {
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
      allowNull: false,
      references: {
        model: 'criteria_master',
        key: 'criteria_code'
      }
    },
    session: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name_of_principal_investigator: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    department_of_principal_investigator: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    duration_of_project: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('Government','Non Government'),
      allowNull: true
    },
    name_of_project: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    year_of_award: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amount_sanctioned: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    name_of_funding_agency: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'response_3_1_1',
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
        name: "idx_r311_criteria",
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
