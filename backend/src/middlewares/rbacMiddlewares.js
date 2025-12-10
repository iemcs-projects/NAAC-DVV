import { rolesCriteria, criteriaControllers } from '../utils/rbacConfig.js';

// Build role permissions cache: role -> Set of allowed controllers
const buildRolePermissions = () => {
  const permissions = new Map();
  
  for (const [role, { criteria }] of Object.entries(rolesCriteria)) {
    const allowedControllers = new Set();
    
    for (const criteriaCode of criteria) {
      const controllers = criteriaControllers[criteriaCode];
      if (controllers) {
        controllers.forEach(c => allowedControllers.add(c));
      }
    }
    
    permissions.set(role, allowedControllers);
  }
  
  return permissions;
};

const rolePermissions = buildRolePermissions();

/**
 * Main RBAC Middleware - Checks if user's role has access to the controller
 * Use this by passing the controller function name as string
 */
export const checkAccess = (controllerName) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const allowedControllers = rolePermissions.get(userRole);
      
      if (!allowedControllers) {
        return res.status(403).json({
          success: false,
          message: 'Invalid role'
        });
      }

      if (!allowedControllers.has(controllerName)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
          requiredController: controllerName,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('RBAC Middleware Error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

/**
 * Check if user has access to a specific criteria code
 * Useful for dynamic routes with criteria parameters
 */
export const checkCriteriaAccess = (criteriaCode) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const roleCriteria = rolesCriteria[userRole];
      
      if (!roleCriteria || !roleCriteria.criteria.includes(criteriaCode)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this criteria',
          criteria: criteriaCode,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Criteria Access Check Error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

/**
 * Dynamic criteria access checker - extracts criteria from route params
 * For routes like /getResponsesByCriteriaCode/:criteriaCode
 */
export const checkDynamicCriteriaAccess = (req, res, next) => {
  try {
    const criteriaCode = req.params.criteriaCode;
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!criteriaCode) {
      return res.status(400).json({
        success: false,
        message: 'Criteria code is required'
      });
    }

    const roleCriteria = rolesCriteria[userRole];
    
    if (!roleCriteria || !roleCriteria.criteria.includes(criteriaCode)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this criteria',
        criteria: criteriaCode,
        userRole: userRole
      });
    }

    next();
  } catch (error) {
    console.error('Dynamic Criteria Access Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};