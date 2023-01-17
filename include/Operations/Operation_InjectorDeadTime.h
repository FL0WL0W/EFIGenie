#include "Operations/Operation.h"

#ifndef OPERATION_INJECTORDEADTIME_H
#define OPERATION_INJECTORDEADTIME_H
namespace EFIGenie
{	
	class Operation_InjectorDeadTime : public OperationArchitecture::Operation<float, uint8_t, float, float, float>
	{
	protected:
		float _minInjectorFuelMass;
	public:
		Operation_InjectorDeadTime(const float minInjectorFuelMass);

		float Execute(uint8_t squirtsPerCycle, float fuelMass, float injectorFlowRate, float injectorDeadTime) override;
		
		static OperationArchitecture::AbstractOperation *Create(const void *config, size_t &sizeOut);
	};
}
#endif