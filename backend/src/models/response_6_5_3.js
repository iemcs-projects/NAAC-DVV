import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class response_6_5_3 extends Model {
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
    initiative_type: {
      type: DataTypes.ENUM('0','1','2','3','4'),
      allowNull: false,
      primaryKey: true
    },
    year: {
      type: DataTypes.DATE,
      allowNull: false
    },
    reg_meetings_of_the_IQAC_head: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    conf_seminar_workshops_on_quality_edu: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    collab_quality_initiatives: {
      type: DataTypes.DATE,
      allowNull: false
    },
    participatipn_in_NIRF: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    from_to_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    other_quality_audit: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'response_6_5_3',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "sl_no" },
          { name: "initiative_type" },
        ]
      },
      {
        name: "fk_r653_master",
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
