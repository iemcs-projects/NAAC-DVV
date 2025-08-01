import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class iiqa_programme_count extends Model {
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
    ug: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    pg: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    post_masters: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    pre_doctoral: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    doctoral: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    post_doctoral: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    pg_diploma: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    diploma: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    certificate: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'iiqa_programme_count',
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
