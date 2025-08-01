import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class iiqa_staff_details extends Model {
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
    perm_male: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    perm_female: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    perm_trans: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    other_male: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    other_female: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    other_trans: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    non_male: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    non_female: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    non_trans: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'iiqa_staff_details',
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
