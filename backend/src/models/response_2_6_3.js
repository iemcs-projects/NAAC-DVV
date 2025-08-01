import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_2_6_3 extends Model {
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
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    program_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    program_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    number_of_students_appeared_in_the_final_year_examination: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    number_of_students_passed_in_the_final_year_examination: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'response_2_6_3',
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
        name: "idx_r263_criteria",
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
