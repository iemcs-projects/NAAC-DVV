import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_2_2_2 extends Model {
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
    name_of_the_full_time_teacher: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    year_of_appointment: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nature_of_appointment: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name_of_department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    total_number_of_years_of_experience_in_the_same_institution: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_the_teacher_still_serving_the_institution: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'response_2_2_2',
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
        name: "idx_r222_criteria",
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
