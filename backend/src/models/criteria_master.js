import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class criteria_master extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    criteria_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    criterion_id: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    sub_criterion_id: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    sub_sub_criterion_id: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    criterion_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sub_criterion_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sub_sub_criterion_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    criteria_type: {
      type: DataTypes.ENUM('Qn','Ql'),
      allowNull: false
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    last_reviewed: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'criteria_master',
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
        name: "uq_criteria",
        unique: true,
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
