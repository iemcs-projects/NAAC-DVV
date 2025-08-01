import express from 'express';
const router = express.Router();
import { 
  getAllCriteria, 
  getCriteriaById, 
  createCriteria, 
  updateCriteria, 
  deleteCriteria 
} from '../controllers/criteriaMaster.controller.js';

// CRUD routes for Criteria Master
router.route('/getAllCriteria').get(getAllCriteria)
router.get('/:id', getCriteriaById);
router.post('/', createCriteria);
router.put('/:id', updateCriteria);
router.delete('/:id', deleteCriteria);

export default router;

