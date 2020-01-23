#include "Operations/Operation_CylinderAirMass_SD.h"

#ifdef OPERATION_CYLINDERAIRMASS_SD
namespace Operations
{
	Operation_CylinderAirMass_SD::Operation_CylinderAirMass_SD(const float cylinderVolume)
	{		
		_cylinderVolume = cylinderVolume;
	}
	
	ScalarVariable Operation_CylinderAirMass_SD::Execute(ScalarVariable cylinderAirTemperature, ScalarVariable map, ScalarVariable VE)
	{				
		float cylinderVolume = _cylinderVolume * 1000 * VE.To<float>(); //ml
		
		float airDensity = (map.To<float>() * 101.325f) / (287 /*GasConstant*/ * (cylinderAirTemperature.To<float>() + 273.15f)); // kg/m^3

		return ScalarVariable(cylinderVolume * airDensity);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_CylinderAirMass_SD, 2007)
}
#endif