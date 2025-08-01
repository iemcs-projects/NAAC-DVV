import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class iiqa_student_details extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    iiqa_form_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'iiqa_form',
        key: 'id'
      }
    },
    regular_male: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    regular_female: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    regular_trans: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'iiqa_student_details',
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
        name: "iiqa_form_id",
        using: "BTREE",
        fields: [
          { name: "iiqa_form_id" },
        ]
      },
    ]
  });
  }
}
