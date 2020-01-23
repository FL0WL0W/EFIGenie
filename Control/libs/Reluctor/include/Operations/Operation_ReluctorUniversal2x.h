#include "Operations/IOperation.h"
#include "Operations/Operation_DigitalPinRecord.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "Operations/ReluctorResult.h"
#include "ScalarVariable.h"

#ifndef OPERATION_RELUCTORUNIVERSAL2X_H
#define OPERATION_RELUCTORUNIVERSAL2X_H
namespace Operations
{
	class Operation_ReluctorUniversal2x : public Operations::IOperation<ReluctorResult, Record*, ScalarVariable>
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
		float _risingPostion;
		float _fallingPosition;
	public:		
        Operation_ReluctorUniversal2x(HardwareAbstraction::ITimerService *, float risingPostion, float fallingPosition);

		ReluctorResult Execute(Record *, ScalarVariable) override;

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif