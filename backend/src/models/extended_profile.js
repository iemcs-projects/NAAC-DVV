import { Model } from "sequelize";
import Sequelize from "sequelize";
export default class extended_profile extends Model {
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
      year: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      number_of_courses_offered: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      total_students: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      reserved_category_seats: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      outgoing_final_year_students: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      full_time_teachers: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      sanctioned_posts: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      total_classrooms: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      total_seminar_halls: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      total_computers: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      expenditure_in_lakhs: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      sequelize,
      tableName: 'extended_profile',
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }]
        },
        {
          name: "iiqa_form_id",
          using: "BTREE",
          fields: [{ name: "iiqa_form_id" }]
        }
      ]
    });
  }
}
