import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_1_3_2 extends Model {
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
    program_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    program_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    course_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    course_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    year_of_offering: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    student_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'response_1_3_2',
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
        name: "idx_r132_criteria",
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
