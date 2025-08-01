import db from "../models/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import apiResponse from "../utils/apiResponse.js";
import apiError from "../utils/apiError.js";
import Sequelize from "sequelize";

// Helper function to convert criteria code to padded format
const convertToPaddedFormat = (code) => {
    // First remove any dots, then split into individual characters
    const parts = code.replace(/\./g, '').split('');
    // Pad each part to 2 digits and join
    return parts.map(part => part.padStart(2, '0')).join('');
  };
  
// import Score from "../models/scores.js";

const Score = db.scores;
const CriteriaMaster = db.criteria_master;
const IIQA = db.iiqa_form;


//score2.1
const score21 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.1");

  // Get 2.1.1 and 2.1.2 criteria
  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: {
        [Sequelize.Op.in]: [
          convertToPaddedFormat("2.1.1"),
          convertToPaddedFormat("2.1.2")
        ]
      }
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Criteria not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  // Fetch existing score rows
  const existingScores = await Score.findAll({
    attributes: ['sub_sub_cr_grade', 'sub_sub_criteria_id', 'criteria_code', 'score_sub_sub_criteria'],
    where: {
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      session,
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  // Calculate grades average
  const grades = existingScores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const sum = grades.reduce((total, value) => total + value, 0);
  const average = grades.length ? sum / grades.length : 0;
  console.log("Average:", average);
  const sub_score = average * 40;
  console.log("sub_score:", sub_score);

  // Ensure all Score rows exist, then update them
  for (const criterion of criteria) {
    if (criterion.sub_criteria_id !== '0201') continue;

    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: 0,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Update all entries under sub_criteria_id = '0201'
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: '0201',
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  // Fetch and return both 2.1.1 and 2.1.2 rows (after update)
  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: {
        [Sequelize.Op.in]: subSubCriteriaIds
      }
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 2.1")
  );
});


//score2.4
const score24 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const subCriteriaId = convertToPaddedFormat("2.4"); // '0204'

  // Get all sub-sub-criteria under 2.4 (020401, 020402, 020403)
  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_criterion_id: subCriteriaId
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Sub-criteria 2.4 not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  // Fetch all scores of sub-sub-criteria under 2.4
  const scoreEntries = await Score.findAll({
    attributes: ['score_sub_sub_criteria', 'sub_sub_cr_grade', 'sub_sub_criteria_id', 'criteria_code'],
    where: {
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      session,
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  // Compute average and weighted sub_score
  const values = scoreEntries.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const average = values.length 
  ? values.reduce((sum, val) => sum + val, 0) / Number(values.length) 
  : 0.0;
  const sub_score = average * 60;

  console.log("Average:", average);
  console.log("Sub-criteria score for 2.4:", sub_score);

  // Ensure all Score rows exist (for each sub-sub-criterion)
  for (const criterion of criteria) {
    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: sub_score,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Update sub_criteria score in all sub-sub rows for sub_criteria 2.4
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: subCriteriaId,
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  // Fetch updated rows and return
  const updatedScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  return res.status(200).json(
    new apiResponse(200, updatedScores, "Score sub_criteria updated for 2.4")
  );
});


//score2.3
const score23 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.3");

  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: {
        [Sequelize.Op.in]: [convertToPaddedFormat("2.3.3")]
      }
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Criteria not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  const scores = await Score.findAll({
    attributes: ['score_sub_sub_criteria', 'sub_sub_criteria_id', 'sub_sub_cr_grade'],
    where: {
      session,
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  const values = scores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sub_score = average * 15;

  console.log("Average:", average);
  console.log("sub_score:", sub_score);

  // Ensure all Score entries exist
  for (const criterion of criteria) {
    if (criterion.sub_criteria_id !== '0203') continue;

    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: 0,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Bulk update for all under 2.3.3
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: '0203',
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: {
        [Sequelize.Op.in]: subSubCriteriaIds
      }
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 2.3")
  );
});


//score2.2
const score22 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("2.2");

  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: {
        [Sequelize.Op.in]: [convertToPaddedFormat("2.2.2")]
      }
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Criteria not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  const scores = await Score.findAll({
    attributes: ['score_sub_sub_criteria', 'sub_sub_criteria_id', 'sub_sub_cr_grade'],
    where: {
      session,
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  const values = scores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sub_score = average * 20;

  console.log("Average:", average);
  console.log("sub_score:", sub_score);

  // Ensure all Score entries exist
  for (const criterion of criteria) {
    if (criterion.sub_criteria_id !== '0202') continue;

    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: 0,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Bulk update for all under 2.2.2
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: '0202',
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: {
        [Sequelize.Op.in]: subSubCriteriaIds
      }
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 2.2")
  );
});


//score2.6
const score26 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const subSubCriteriaId = convertToPaddedFormat("2.6.3"); // '020601030103'

  // Step 1: Fetch only 2.6.3 from CriteriaMaster
  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: subSubCriteriaId
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Sub-sub-criteria 2.6.3 not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);

  // Step 2: Fetch Score entries for 2.6.3
  const scores = await Score.findAll({
    attributes: ['score_sub_sub_criteria', 'sub_sub_criteria_id', 'sub_sub_cr_grade'],
    where: {
      session,
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      sub_sub_criteria_id: subSubCriteriaId
    }
  });

  // Step 3: Calculate average and sub_score
  const values = scores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sub_score = average * 30;

  console.log("Average:", average);
  console.log("sub_score:", sub_score);

  // Step 4: Ensure Score row exists
  for (const criterion of criteria) {
    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: 0,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Step 5: Update the score_sub_criteria for 2.6.3
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_sub_criteria_id: subSubCriteriaId
      }
    }
  );

  // Step 6: Return updated score entry
  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: subSubCriteriaId
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 2.6.3")
  );
});


//score2
const score2 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear().toString();
  const criteria_id = "02";

  let scores = await Score.findAll({
    attributes: [
      'sub_criteria_id',
      'score_sub_criteria',
      'score_sub_sub_criteria',
      'sub_sub_criteria_id'
    ],
    where: {
      criteria_id: criteria_id,
      session: session,
      [Sequelize.Op.or]: [
        { score_sub_criteria: { [Sequelize.Op.gt]: 0 } },
        { score_sub_sub_criteria: { [Sequelize.Op.gt]: 0 } }
      ]
    },
    raw: true
  });

  // Fill missing sub_criteria_id using sub_sub_criteria_id from CriteriaMaster
  for (let i = 0; i < scores.length; i++) {
    if (!scores[i].sub_criteria_id && scores[i].sub_sub_criteria_id) {
      const criteriaMap = await CriteriaMaster.findOne({
        where: { sub_sub_criterion_id: scores[i].sub_sub_criteria_id },
        attributes: ['sub_criterion_id'],
        raw: true
      });
      if (criteriaMap) {
        scores[i].sub_criteria_id = criteriaMap.sub_criterion_id;
      }
    }
  }

  const subCriteriaScores = {};
  scores.forEach(score => {
    const subId = score.sub_criteria_id;
    if (subId) {
      const maxScore = Math.max(
        score.score_sub_criteria || 0,
        score.score_sub_sub_criteria || 0
      );
      if (!subCriteriaScores[subId] || subCriteriaScores[subId] < maxScore) {
        subCriteriaScores[subId] = maxScore;
      }
    }
  });

  const totalScore = Object.values(subCriteriaScores).reduce((sum, score) => sum + parseFloat(score), 0);
  const cri_score = totalScore / 225;
  const weighted_cri_score = cri_score * 0.3;
  console.log("cri_score:", cri_score);
  console.log("weighted_cri_score:", weighted_cri_score);
  const adjustedWeightedCriScore = weighted_cri_score * 1000;
  const criteria = await CriteriaMaster.findOne({ where: { criterion_id: criteria_id } });
  if (!criteria) throw new apiError(404, "Criteria not found");

  // Update or create a placeholder row (this helps if you still want to keep one main entry)
const [entry, created] = await Score.findOrCreate({
  where: {
    criteria_code: criteria.criteria_code,
    session: session,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id
  },
  defaults: {
    criteria_code: criteria.criteria_code,
    criteria_id: criteria.criterion_id,
    sub_criteria_id: criteria.sub_criterion_id,
    sub_sub_criteria_id: criteria.sub_sub_criterion_id,
    score_criteria: cri_score,
    score_sub_criteria: 0,
    score_sub_sub_criteria: 0,
    weighted_cr_score: adjustedWeightedCriScore,
    session: session
  }
});

// Always update all rows with this criteria_id
await Score.update(
  { score_criteria: cri_score,
    weighted_cr_score: adjustedWeightedCriScore,
   },
  {
    where: {
      criteria_id: criteria_id,
      session: session
    }
  }
);


  return res.status(200).json(
    new apiResponse(200, {
      score: cri_score,
      totalSubCriteriaScore: totalScore,
      adjustedWeightedCriScore: adjustedWeightedCriScore,
      weightedCRScore: weighted_cri_score,
      subCriteriaScores: Object.entries(subCriteriaScores).map(([id, score]) => ({
        sub_criteria_id: id,
        score_sub_criteria: score
      }))
    }, created ? "Score created successfully" : "Score updated successfully")
  );
});

//score1.1
const score11 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.1");

  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: {
        [Sequelize.Op.in]: [convertToPaddedFormat("1.1.3")]
      }
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Criteria not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  const scores = await Score.findAll({
    attributes: ['score_sub_sub_criteria', 'sub_sub_criteria_id', 'sub_sub_cr_grade'],
    where: {
      session,
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  const values = scores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sub_score = average * 5;

  console.log("Average:", average);
  console.log("sub_score:", sub_score);

  // Ensure all Score entries exist
  for (const criterion of criteria) {
    if (criterion.sub_criteria_id !== '0101') continue;

    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: sub_score,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Bulk update for all under 1.1.3
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: '0101',
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: {
        [Sequelize.Op.in]: subSubCriteriaIds
      }
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 1.3")
  );
});

//score1.2
const score12 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.2");

  // Get 2.1.1 and 2.1.2 criteria
  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: {
        [Sequelize.Op.in]: [
          convertToPaddedFormat("1.2.1"),
          convertToPaddedFormat("1.2.2"),
          convertToPaddedFormat("1.2.3") 
        ]
      }
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Criteria not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  // Fetch existing score rows
  const existingScores = await Score.findAll({
    attributes: ['sub_sub_cr_grade', 'sub_sub_criteria_id', 'criteria_code', 'score_sub_sub_criteria'],
    where: {
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      session,
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  // Calculate grades average
  const grades = existingScores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const sum = grades.reduce((total, value) => total + value, 0);
  const average = grades.length ? sum / grades.length : 0;
  console.log("Average:", average);
  const sub_score = average * 30;
  console.log("sub_score:", sub_score);

  // Ensure all Score rows exist, then update them
  for (const criterion of criteria) {
    if (criterion.sub_criteria_id !== '0102') continue;

    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: sub_score,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Update all entries under sub_criteria_id = '0102'
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: '0102',
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  // Fetch and return 1.2.1 and 1.2.2 and 1.2.3 rows (after update)
  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: {
        [Sequelize.Op.in]: subSubCriteriaIds
      }
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 1.2")
  );
});

//score1.3
const score13 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.3");

  // Get 2.1.1 and 2.1.2 criteria
  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: {
        [Sequelize.Op.in]: [
          convertToPaddedFormat("1.3.2"),
          convertToPaddedFormat("1.3.3")
        ]
      }
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Criteria not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  // Fetch existing score rows
  const existingScores = await Score.findAll({
    attributes: ['sub_sub_cr_grade', 'sub_sub_criteria_id', 'criteria_code', 'score_sub_sub_criteria'],
    where: {
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      session,
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  // Calculate grades average
  const grades = existingScores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const sum = grades.reduce((total, value) => total + value, 0);
  const average = grades.length ? sum / grades.length : 0;
  console.log("Average:", average);
  const sub_score = average * 20;
  console.log("sub_score:", sub_score);

  // Ensure all Score rows exist, then update them
  for (const criterion of criteria) {
    if (criterion.sub_criteria_id !== '0103') continue;

    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: sub_score,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Update all entries under sub_criteria_id = '0103'
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: '0103',
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  // Fetch and return 1.3.2 and 1.3.3 rows (after update)
  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: {
        [Sequelize.Op.in]: subSubCriteriaIds
      }
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 1.3")
  );
});

//score1.4
const score14 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear();
  const criteria_code = convertToPaddedFormat("1.4");

  // Get 2.1.1 and 2.1.2 criteria
  const criteria = await CriteriaMaster.findAll({
    where: {
      sub_sub_criterion_id: {
        [Sequelize.Op.in]: [
          convertToPaddedFormat("1.4.1"),
          convertToPaddedFormat("1.4.2") 
        ]
      }
    }
  });

  if (!criteria || criteria.length === 0) {
    throw new apiError(404, "Criteria not found");
  }

  const criteriaCodes = criteria.map(c => c.criteria_code);
  const subSubCriteriaIds = criteria.map(c => c.sub_sub_criterion_id);

  // Fetch existing score rows
  const existingScores = await Score.findAll({
    attributes: ['sub_sub_cr_grade', 'sub_sub_criteria_id', 'criteria_code', 'score_sub_sub_criteria'],
    where: {
      criteria_code: { [Sequelize.Op.in]: criteriaCodes },
      session,
      sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
    }
  });

  // Calculate grades average
  const grades = existingScores.map(s => parseFloat(s.sub_sub_cr_grade) || 0);
  const sum = grades.reduce((total, value) => total + value, 0);
  const average = grades.length ? sum / grades.length : 0;
  console.log("Average:", average);
  const sub_score = average * 20;
  console.log("sub_score:", sub_score);

  // Ensure all Score rows exist, then update them
  for (const criterion of criteria) {
    if (criterion.sub_criteria_id !== '0104') continue;

    await Score.findOrCreate({
      where: {
        criteria_code: criterion.criteria_code,
        session,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id
      },
      defaults: {
        criteria_code: criterion.criteria_code,
        criteria_id: criterion.criterion_id,
        sub_criteria_id: criterion.sub_criteria_id,
        sub_sub_criteria_id: criterion.sub_sub_criterion_id,
        score_criteria: 0,
        score_sub_criteria: sub_score,
        score_sub_sub_criteria: 0,
        sub_sub_cr_grade: 0,
        session
      }
    });
  }

  // Update all entries under sub_criteria_id = '0104'
  await Score.update(
    { score_sub_criteria: sub_score },
    {
      where: {
        session,
        sub_criteria_id: '0104',
        sub_sub_criteria_id: { [Sequelize.Op.in]: subSubCriteriaIds }
      }
    }
  );

  // Fetch and return 1.4.1 and 1.4.2 rows (after update)
  const finalScores = await Score.findAll({
    where: {
      session,
      sub_sub_criteria_id: {
        [Sequelize.Op.in]: subSubCriteriaIds
      }
    }
  });

  return res.status(200).json(
    new apiResponse(200, finalScores, "Score sub_criteria updated for 1.4")
  );
});

//score1
const score1 = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear().toString();
  const criteria_id = "01"; // Criterion 1

  let scores = await Score.findAll({
    attributes: [
      'sub_criteria_id',
      'score_sub_criteria',
      'score_sub_sub_criteria',
      'sub_sub_criteria_id'
    ],
    where: {
      criteria_id: criteria_id,
      session: session,
      [Sequelize.Op.or]: [
        { score_sub_criteria: { [Sequelize.Op.gt]: 0 } },
        { score_sub_sub_criteria: { [Sequelize.Op.gt]: 0 } }
      ]
    },
    raw: true
  });

  // Fill missing sub_criteria_id using sub_sub_criteria_id from CriteriaMaster
  for (let i = 0; i < scores.length; i++) {
    if (!scores[i].sub_criteria_id && scores[i].sub_sub_criteria_id) {
      const criteriaMap = await CriteriaMaster.findOne({
        where: { sub_sub_criterion_id: scores[i].sub_sub_criteria_id },
        attributes: ['sub_criterion_id'],
        raw: true
      });
      if (criteriaMap) {
        scores[i].sub_criteria_id = criteriaMap.sub_criterion_id;
      }
    }
  }

  // Group by sub_criteria_id, pick highest value between sub_criteria and sub_sub_criteria scores
  const subCriteriaScores = {};
  scores.forEach(score => {
    const subId = score.sub_criteria_id;
    if (subId) {
      const maxScore = Math.max(
        score.score_sub_criteria || 0,
        score.score_sub_sub_criteria || 0
      );
      if (!subCriteriaScores[subId] || subCriteriaScores[subId] < maxScore) {
        subCriteriaScores[subId] = maxScore;
      }
    }
  });

  // Final total and score calculation
  const totalScore = Object.values(subCriteriaScores).reduce((sum, s) => sum + parseFloat(s), 0);
  const cri_score = parseFloat((totalScore / 75).toFixed(2)); 
  const weighted_cri_score = cri_score * 0.1;
  console.log("cri_score:", cri_score);
  console.log("weighted_cri_score:", weighted_cri_score);
  const adjustedWeightedCriScore = weighted_cri_score * 1000;
  // Fixed denominator = 75

  // Optional: Create/update a row in Score for reference
  const criteria = await CriteriaMaster.findOne({ where: { criterion_id: criteria_id } });
  if (!criteria) throw new apiError(404, "Criteria not found");

  await Score.update(
    {
      score_criteria: cri_score,
      weighted_cr_score: adjustedWeightedCriScore,
    },
    {
      where: {
        criteria_id: criteria_id,
        session: session
      }
    }
  );

  return res.status(200).json(
    new apiResponse(200, {
      score: cri_score,
      totalSubCriteriaScore: totalScore,
      adjustedWeightedCriScore: adjustedWeightedCriScore,
      weightedCRScore: weighted_cri_score,
      subCriteriaScores: Object.entries(subCriteriaScores).map(([id, score]) => ({
        sub_criteria_id: id,
        score_sub_criteria: score
      }))
    }, "Score for Criterion 1 calculated successfully")
  );
});

 /*        4       3       2       1       0
    2.1.1	>=80%	60%-80%	40%- 60%	30%-40%	<30%
    2.1.2	>=80%	60%-80%	40%- 60%	30%-40%	<30%
    2.2.2	<20:1	20-30:1	30-40:1	  40-50:1	>50:1
    2.3.3					
    2.4.1	>=75%	65%-75%	50%- 65%	40%-50%	<40%
    2.4.3	>=15%	12%-15%	9%- 12%	  6%-9%	  <6%
    2.4.2	>=75%	60%-75%	50%- 60%	30%-50%	<30%
    2.6.3	>=90%	80%-90%	70%- 80%	60%-70%	<60%

    Criteria	Target  Sub-Criteria  Weightage
        2.1		160.0      2.1.1		    20
        2.1		160.0      2.1.2		    20
        2.2		80.0       2.2.2		    20
        2.3		60.0       2.3.3		    15
        2.4		240.0      2.4.1		    20
        2.4		240.0      2.4.2		    20
        2.4		240.0      2.4.3		    20
        2.6		120.0      2.6.3		    30
    */
//   const calculateTarget21 = async () => {
//       const weights = [20, 20]; // 2.1.1 and 2.1.2
//       const target = 160;
        
//       const scores = await Score.findAll({
//         attributes: ['sub_sub_cr_grade'],
//         where: { sub_criteria_id: '0201' }
//       });
        
//       const grades = scores.map(r => Number(r.sub_sub_cr_grade));
//       if (grades.length !== 2) throw new Error("Expected 2 grades for 2.1.1 and 2.1.2");
        
//       const weighted = grades.map((g, i) => g * weights[i]);
//       const total = weighted.reduce((a, b) => a + b, 0);
//       const percentage = (total / target) * 100;
//       const averageGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
        
//       return {
//             "2.1.1": { grade: grades[0], targetPercentage: (weighted[0] / target) * 100 },
//             "2.1.2": { grade: grades[1], targetPercentage: (weighted[1] / target) * 100 },
//             percentage: +percentage.toFixed(2),
//             averageGrade: +averageGrade.toFixed(2)
//           };
// };
        
//         const calculateTarget22 = async () => {
//           const weight = 20, target = 80;
//           const score = await Score.findOne({
//             attributes: ['sub_sub_cr_grade'],
//             where: { sub_criteria_id: '0202' }
//           });
        
//           if (!score) throw new Error("No grade for 2.2.2");
        
//           const grade = Number(score.sub_sub_cr_grade);
//           return {
//             "2.2.2": {
//               grade,
//               targetPercentage: +(grade * weight / target * 100).toFixed(2)
//             }
//           };
//         };
        
//         const calculateTarget23 = async () => {
//           const weight = 15, target = 60;
//           const score = await Score.findOne({
//             attributes: ['sub_sub_cr_grade'],
//             where: { sub_criteria_id: '0203' }
//           });
        
//           if (!score) throw new Error("No grade for 2.3.3");
        
//           const grade = Number(score.sub_sub_cr_grade);
//           return {
//             "2.3.3": {
//               grade,
//               targetPercentage: +(grade * weight / target * 100).toFixed(2)
//             }
//           };
//         };
        
//         const calculateTarget24 = async () => {
//           const weights = [20, 20, 20];
//           const target = 240;
        
//           const scores = await Score.findAll({
//             attributes: ['sub_sub_cr_grade'],
//             where: { sub_criteria_id: '0204' },
//             order: [['sub_sub_criteria_id', 'ASC']]
//           });
        
//           const grades = scores.map(r => Number(r.sub_sub_cr_grade));
//           if (grades.length !== 3) throw new Error("Expected 3 grades for 2.4.1, 2.4.2, 2.4.3");
        
//           const keys = ["2.4.1", "2.4.2", "2.4.3"];
//           const weightedScores = grades.map((g, i) => g * weights[i]);
        
//           const data = {};
//           keys.forEach((k, i) => {
//             data[k] = {
//               grade: grades[i],
//               targetPercentage: +(weightedScores[i] / target * 100).toFixed(2)
//             };
//           });
        
//           const totalWeighted = weightedScores.reduce((a, b) => a + b, 0);
//           const averageGrade = +(grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2);
        
//           return {
//             ...data,
//             percentage: +(totalWeighted / target * 100).toFixed(2),
//             averageGrade
//           };
//         };
        
//         const calculateTarget26 = async () => {
//           const weight = 30, target = 120;
//           const score = await Score.findOne({
//             attributes: ['sub_sub_cr_grade'],
//             where: { sub_criteria_id: '0206' }
//           });
        
//           if (!score) throw new Error("No grade for 2.6.3");
        
//           const grade = Number(score.sub_sub_cr_grade);
//           return {
//             "2.6.3": {
//               grade,
//               targetPercentage: +(grade * weight / target * 100).toFixed(2)
//             }
//           };
//         };
        

//         const target2 = asyncHandler(async (req, res) => {
//           const weights = [40, 30, 30, 25, 40, 60]; // example weights for 2.1 to 2.6
//           const maxTarget = 225; // Total weight

//           const scoreResponse = await Score.findAll({
//             attributes: ['score_sub_criteria', 'sub_criteria_id'],
//             where: {
//               criteria_id: '02',
//             }
//           });

//           const subCriteria = {
//             '0201': 0,
//             '0202': 1,
//             '0203': 2,
//             '0204': 3,
//             '0205': 4,
//             '0206': 5
//           };

//           const weightedScores = scoreResponse
//             .filter(score => subCriteria[score.sub_criteria_id] !== undefined)
//             .map(score => {
//               const index = subCriteria[score.sub_criteria_id];
//               return (parseFloat(score.score_sub_criteria) || 0) * weights[index];
//             });

//           const total = weightedScores.reduce((sum, s) => sum + s, 0);
//           const percentage = (total / maxTarget) * 100;

//           return res.status(200).json(
//             new apiResponse(200, { percentage: percentage.toFixed(2) }, "Overall percentage for Criterion 2")
//           );
//         });



const getCollegeSummary = asyncHandler(async (req, res) => {
  const collegeId = 1;
  const session = new Date().getFullYear();

  const gradeTargetMap = {
    "A++": { gpa: 2.455, score: 0.7365 },
    "A+": { gpa: 2.205, score: 0.6615 },
    "A": { gpa: 2.04, score: 0.612 },
    "B++": { gpa: 1.88, score: 0.564 },
    "B+": { gpa: 1.715, score: 0.5145 },
    "B": { gpa: 1.47, score: 0.441 },
    "C": { gpa: 1.145, score: 0.3435 },
    "D": { gpa: 0.49, score: 0.24 }
  };

  const subCriteriaTargetMap = {
    "2.1": { "A++": 98, "A+": 88.2, "A": 81.6, "B++": 75.2, "B+": 68.6, "B": 58.8, "C": 45.8 },
    "2.2": { "A++": 49, "A+": 44.1, "A": 40.8, "B++": 37.6, "B+": 34.3, "B": 29.4, "C": 22.9 },
    "2.3": { "A++": 36.75, "A+": 33.075, "A": 30.6, "B++": 28.2, "B+": 25.725, "B": 22.05, "C": 17.175 },
    "2.4": { "A++": 147, "A+": 132.3, "A": 122.4, "B++": 112.8, "B+": 102.9, "B": 88.2, "C": 68.7 },
    "2.6": { "A++": 73.5, "A+": 66.15, "A": 61.2, "B++": 56.4, "B+": 51.45, "B": 44.1, "C": 34.35 },
    "2.7": { "A++": 147, "A+": 132.3, "A": 122.4, "B++": 112.8, "B+": 102.9, "B": 88.2, "C": 68.7 }
  };

  const getGrade = (gpa) => {
    if (gpa >= 2.29) return "A++";
    if (gpa >= 2.12) return "A+";
    if (gpa >= 1.96) return "A";
    if (gpa >= 1.8) return "B++";
    if (gpa >= 1.63) return "B+";
    if (gpa >= 1.31) return "B";
    if (gpa >= 0.98) return "C";
    return "D";
  };

  const iiqaForm = await IIQA.findOne({
    attributes: ['desired_grade'],
    where: { institution_id: collegeId },
    order: [['year_filled', 'DESC']],
    limit: 1
  });

  const desiredGrade = iiqaForm?.desired_grade || "A";
  const resolvedGrade = desiredGrade === "D" ? "C" : desiredGrade;

  const targetGPA = gradeTargetMap[desiredGrade]?.gpa || gradeTargetMap["A"].gpa;

  const allScores = await Score.findAll({
    where: { session },
    raw: true
  });

  const distinctCriteria = [...new Set(allScores.map(row => row.criteria_id))].filter(id => id !== '00');

  const result = [];

  for (const criteria_id of distinctCriteria) {
    const masterRows = await CriteriaMaster.findAll({
      where: { criterion_id: criteria_id },
      raw: true
    });

    const scoreRows = allScores.filter(r => r.criteria_id === criteria_id);

    if (!masterRows.length || !scoreRows.length) continue;

    const criteriaMap = {};

    for (const row of masterRows) {
      const {
        sub_criterion_id,
        sub_sub_criterion_id,
        sub_criterion_name,
        sub_sub_criterion_name,
        criterion_name
      } = row;

      const subCode = sub_criterion_id.replace(/^0?(\d)(\d)/, "$1.$2");
      const target = subCriteriaTargetMap[subCode]?.[resolvedGrade] || 100;

      if (!criteriaMap[sub_criterion_id]) {
        criteriaMap[sub_criterion_id] = {
          code: subCode,
          title: sub_criterion_name,
          score: 0,
          target,
          sub_sub_criteria: []
        };
      }

      const scoreRow = scoreRows.find(s => s.sub_sub_criteria_id === sub_sub_criterion_id);
      const score = parseFloat(scoreRow?.score_sub_sub_criteria || 0);

      criteriaMap[sub_criterion_id].sub_sub_criteria.push({
        code: sub_sub_criterion_id.replace(/^0?(\d)(\d)(\d)(\d)/, "$1.$2.$3$4"),
        title: sub_sub_criterion_name,
        score
      });

      criteriaMap[sub_criterion_id].score += score;
    }

    const subcriteriaArr = Object.values(criteriaMap).map(obj => {
      const targetPercentage = obj.score ? ((obj.score / obj.target) * 100).toFixed(2) : 0;
      return {
        code: obj.code,
        title: obj.title,
        score: +obj.score.toFixed(2),
        target: obj.target,
        targetPercentage: +targetPercentage
      };
    });

    // ✅ FIX: Use weighted_cr_score/1000 for individual criteria scores
    const weightedCrScore = parseFloat(scoreRows[0]?.weighted_cr_score || 0);
    const totalScore = +(weightedCrScore / 1000).toFixed(3); // This will show 0.474 for criteria 02 and 0.367 for criteria 01
    
    const gpa = parseFloat(scoreRows[0]?.score_criteria || 0);
    const grade = getGrade(gpa);

    const avgGrade =
      scoreRows.length > 0
        ? scoreRows.reduce((sum, r) => sum + (parseFloat(r.sub_sub_cr_grade) || 0), 0) / scoreRows.length
        : 0;

    result.push({
      id: parseInt(criteria_id),
      title: masterRows[0]?.criterion_name || `Criterion ${criteria_id}`,
      score: totalScore, // ✅ This should show 1.58 for criteria 02 and 3.67 for criteria 01
      target: gradeTargetMap[desiredGrade]?.score || 0.612,
      status: totalScore >= (gradeTargetMap[desiredGrade]?.score || 0) ? "Near Target" : "Below Target",
      averageGrade: +avgGrade.toFixed(2),
      subcriteria: subcriteriaArr
    });
  }

  // ✅ FIXED: Use only criteria '00' which contains the total weighted score
  const totalCriteriaRow = allScores.find(row => row.criteria_id === '00');
  const totalWeightedScore = totalCriteriaRow ? parseFloat(totalCriteriaRow.weighted_cr_score) || 0 : 0;
  const currentGPA = +(totalWeightedScore / 1000).toFixed(3);
  const finalGrade = getGrade(currentGPA);
  
  // ✅ DEBUG: Log to see what's happening
  console.log('Total criteria row (00):', totalCriteriaRow?.weighted_cr_score);
  console.log('Current GPA:', currentGPA);

  return res.status(200).json({
    collegeId,
    currentGPA, // ✅ 0.841
    targetGPA,
    grade: finalGrade, // ✅ "D"
    criteria: result // ✅ Each criteria will show correct individual scores
  });
});



        

//totalscore
const scoreTotal = asyncHandler(async (req, res) => {
  const session = new Date().getFullYear().toString();

  // Step 1: Fetch all rows with non-zero weighted_cr_score for session
  const allScores = await Score.findAll({
    attributes: ['criteria_id', 'weighted_cr_score'],
    where: {
      session: session,
      weighted_cr_score: { [Sequelize.Op.gt]: 0 },
      sub_criteria_id: { [Sequelize.Op.ne]: null },
      sub_sub_criteria_id: { [Sequelize.Op.ne]: null }
    },
    raw: true
  });

  // Step 2: For each criteria_id, retain max weighted_cr_score
  const weightedMap = {};
  for (const score of allScores) {
    const id = score.criteria_id;
    const weight = parseFloat(score.weighted_cr_score);
    if (!weightedMap[id] || weightedMap[id] < weight) {
      weightedMap[id] = weight;
    }
  }

  // Step 3: Sum available weighted scores
  const totalWeighted = Object.values(weightedMap).reduce((sum, w) => sum + w, 0);
  console.log("Total weighted score:", totalWeighted);
  const adjustedTotalWeighted = totalWeighted / 1000;
  console.log("Adjusted total weighted score:", adjustedTotalWeighted);

  // Step 4: Determine grade (do not store this, only return it)
  let grade;
  if (adjustedTotalWeighted >= 2.29 && adjustedTotalWeighted <= 2.62) {
    grade = 'A++';
  } else if (adjustedTotalWeighted >= 2.12 && adjustedTotalWeighted < 2.29) {
    grade = 'A+';
  } else if (adjustedTotalWeighted >= 1.96 && adjustedTotalWeighted < 2.12) {
    grade = 'A';
  } else if (adjustedTotalWeighted >= 1.8 && adjustedTotalWeighted < 1.96) {
    grade = 'B++';
  } else if (adjustedTotalWeighted >= 1.63 && adjustedTotalWeighted < 1.8) {
    grade = 'B+';
  } else if (adjustedTotalWeighted >= 1.31 && adjustedTotalWeighted < 1.63) {
    grade = 'B';
  } else if (adjustedTotalWeighted >= 0.98 && adjustedTotalWeighted < 1.31) {
    grade = 'C';
  } else {
    grade = 'D';
  }

  // Step 5: Insert or update total score row (criteria_id = '00')
  const [entry, created] = await Score.findOrCreate({
    where: {
      criteria_id: '00',
      session: session,
      sub_criteria_id: '0000',
      sub_sub_criteria_id: '000000'
    },
    defaults: {
      criteria_code: '000000000000',
      criteria_id: '00',
      sub_criteria_id: '0000',
      sub_sub_criteria_id: '000000',
      score_criteria: totalWeighted,
      weighted_cr_score: totalWeighted,  // ✅ numeric value only
      score_sub_criteria: 0,
      score_sub_sub_criteria: 0,
      session: session
    }
  });

  if (!created) {
    const updated = await Score.update(
      {
        weighted_cr_score: totalWeighted
      },
      {
        where: {
          criteria_id: '00',
          session: session,
          sub_criteria_id: '0000',
          sub_sub_criteria_id: '000000'
        }
      }
    );
    console.log("Rows updated:", updated[0]); // should be > 0
  }
  

  // Step 6: Return response with grade string
  return res.status(200).json(
    new apiResponse(200, {
      totalWeightedScore: totalWeighted,
      Grade: grade,
      criteriaWiseWeightedScores: Object.entries(weightedMap).map(([id, score]) => ({
        criteria_id: id,
        weighted_cr_score: score
      }))
    }, created ? "Total weighted score created" : "Total weighted score updated")
  );
});

const radarGrade = asyncHandler(async (req, res) => {
  const weightedTargetMap = {
    "1": {
      "A++": 0.2455,
      "A+": 0.2205,
      "A": 0.204,
      "B++": 0.188,
      "B+": 0.1715,
      "B": 0.147,
      "C": 0.1145
    },
    "2": {
      "A++": 0.7365,
      "A+": 0.6615,
      "A": 0.612,
      "B++": 0.564,
      "B+": 0.5145,
      "B": 0.441,
      "C": 0.3435
    },
    "3": {
      "A++": 0.491,
      "A+": 0.441,
      "A": 0.408,
      "B++": 0.376,
      "B+": 0.343,
      "B": 0.294,
      "C": 0.229
    },
    "4": {
      "A++": 0.2455,
      "A+": 0.2205,
      "A": 0.204,
      "B++": 0.188,
      "B+": 0.1715,
      "B": 0.147,
      "C": 0.1145
    },
    "5": {
      "A++": 0.2455,
      "A+": 0.2205,
      "A": 0.204,
      "B++": 0.188,
      "B+": 0.1715,
      "B": 0.147,
      "C": 0.1145
    },
    "6": {
      "A++": 0.2455,
      "A+": 0.2205,
      "A": 0.204,
      "B++": 0.188,
      "B+": 0.1715,
      "B": 0.147,
      "C": 0.1145
    },
    "7": {
      "A++": 0.2455,
      "A+": 0.2205,
      "A": 0.204,
      "B++": 0.188,
      "B+": 0.1715,
      "B": 0.147,
      "C": 0.1145
    }
  };
  
  const session = new Date().getFullYear();
  const collegeId = 1; // Or get from request if needed

  // 1️⃣ Get desired grade from IIQA form
  const iiqaForm = await IIQA.findOne({
    attributes: ['desired_grade'],
    where: { institution_id: collegeId },
    order: [['year_filled', 'DESC']],
    limit: 1
  });
  const desiredGrade = iiqaForm?.dataValues?.desired_grade || "A";

  // 2️⃣ Fetch all criteria scores for the current session
  const criteriaScores = await Score.findAll({
    where: {
      session: session,
      criteria_id: {
        [Sequelize.Op.in]: ['01', '02', '03', '04', '05', '06', '07']
      }
    },
    attributes: ['criteria_id', 'weighted_cr_score'],
    raw: true
  });

  // 3️⃣ Get criteria names from CriteriaMaster
  const criteriaList = await CriteriaMaster.findAll({
    where: {
      criterion_id: {
        [Sequelize.Op.in]: ['01', '02', '03', '04', '05', '06', '07']
      }
    },
    attributes: [
      'criterion_id',
      [Sequelize.fn('MAX', Sequelize.col('criterion_name')), 'criterion_name']
    ],
    group: ['criterion_id'],
    raw: true
  });

  // 4️⃣ Process current scores
  const currentScores = Array(7).fill(0);
  criteriaScores.forEach(score => {
    const index = parseInt(score.criteria_id) - 1;
    if (index >= 0 && index < 7) {
      console.log(score.weighted_cr_score);
      currentScores[index] = parseFloat(score.weighted_cr_score)/1000 || 0;
    }
  });

  // 5️⃣ Get target scores based on desired grade
  const targetScores = Array(7).fill(0).map((_, index) => {
    const criteriaId = (index + 1).toString();
    return weightedTargetMap[criteriaId]?.[desiredGrade] || 0; // Convert to percentage
  });

  // 6️⃣ Prepare response
  const criteriaData = {
    criteria: criteriaList.map(criteria => ({
      id: parseInt(criteria.criterion_id),
      name: criteria.criterion_name || `Criterion ${criteria.criterion_id}`,
      max: 1
    })).sort((a, b) => a.id - b.id), // Ensure proper ordering
    
    scores: [
      {
        name: 'Current Score',
        values: currentScores.map(score => Math.min(100, Math.max(0, score))) // Ensure scores are within 0-100 range
      },
      {
        name: 'Target Score',
        values: targetScores
      }
    ]
  };

  return res.status(200).json(criteriaData);
});


export { score21, score22, score23, score24, score26, score2, score11, score12, score13, score14, score1, scoreTotal, getCollegeSummary, radarGrade };
