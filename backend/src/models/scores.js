import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class scores extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    sl_no: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    criteria_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      references: {
        model: 'criteria_master',
        key: 'criteria_code'
      }
    },
    criteria_id: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    score_criteria: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    sub_criteria_id: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    score_sub_criteria: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    sub_sub_criteria_id: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    score_sub_sub_criteria: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    session: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    cycle_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    computed_by: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    computed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    sub_sub_cr_grade: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    weighted_cr_score: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'scores',
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
        name: "fk_scores_master",
        using: "BTREE",
        fields: [
          { name: "criteria_code" },
        ]
      },
    ]
  });
  }
}
