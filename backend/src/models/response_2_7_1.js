import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_2_7_1 extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sl_no: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'criteria_master',
        key: 'id'
      }
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
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name_of_the_student: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    state_of_domicile: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    nationality_if_other_than_indian: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    email_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    program_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    unique_enrolment_id_college_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mobile_number: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    year_of_joining: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'response_2_7_1',
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
        name: "idx_r271_criteria",
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
