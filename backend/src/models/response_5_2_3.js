import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_5_2_3 extends Model {
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
    registeration_number: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    students_appearing: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    exam_net: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_slet: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_gate: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_gmat: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_cat: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_gre: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_jam: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_ielts: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_toefl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_civil_services: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_state_services: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    exam_other: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'response_5_2_3',
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
        name: "fk_r523_master",
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
