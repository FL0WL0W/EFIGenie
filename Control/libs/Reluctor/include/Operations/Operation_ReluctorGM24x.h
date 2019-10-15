#include "Operations/IOperation.h"
#include "Variables/Variable_DigitalPinRecord.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "Operations/ReluctorResult.h"
#include "ScalarVariable.h"

#ifndef OPERATION_RELUCTORGM24X_H
#define OPERATION_RELUCTORGM24X_H
namespace Operations
{
	class Operation_ReluctorGM24x : public Operations::IOperation<ReluctorResult, Variables::Record*, ScalarVariable>
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
	public:		
        Operation_ReluctorGM24x(HardwareAbstraction::ITimerService *);

		ReluctorResult Execute(Variables::Record *, ScalarVariable) override;
		bool IsLongPulse(Variables::Record *, uint8_t frame);

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif