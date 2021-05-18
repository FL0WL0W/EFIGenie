#include "Operations/IOperation.h"

#ifndef OPERATION_CYLINDERAIRMASS_SD
#define OPERATION_CYLINDERAIRMASS_SD
namespace OperationArchitecture
{	
	class Operation_CylinderAirMass_SD : public IOperation<float, float, float, float>
	{
	protected:
		float _cylinderVolume;
	public:
		Operation_CylinderAirMass_SD(const float cylinderVolume);

		float Execute(float cylinderAirTemperature, float manifoldAbsolutePressure, float VolumetricEfficiency) override;
		
		static IOperationBase *Create(const void *config, size_t &sizeOut);
	};
}
#endif