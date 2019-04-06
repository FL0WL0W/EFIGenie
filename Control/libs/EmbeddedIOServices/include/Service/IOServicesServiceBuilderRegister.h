#include "IOServices/BooleanInputService/IBooleanInputService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "IOServices/ButtonService/IButtonService.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "IOServices/FloatOutputService/IFloatOutputService.h"
#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "Service/ServiceBuilder.h"

using namespace IOServices;

#ifndef IOSERVICESSERVICEBUILDEREGISTER_H
#define IOSERVICESSERVICEBUILDEREGISTER_H

namespace Service
{
	class IOServicesServiceBuilderRegister
	{
	public:
		static void Register(ServiceBuilder *&serviceBuilder)
		{
			serviceBuilder->Register(BUILDER_IBOOLEANINPUTSERVICE, IBooleanInputService::BuildBooleanInputService);
			serviceBuilder->Register(BUILDER_IBOOLEANOUTPUTSERVICE, IBooleanOutputService::BuildBooleanOutputService);
			serviceBuilder->Register(BUILDER_IBUTTONSERVICE, IButtonService::BuildButtonService);
			serviceBuilder->Register(BUILDER_IFLOATINPUTSERVICE, IFloatInputService::BuildFloatInputService);
			serviceBuilder->Register(BUILDER_IFLOATOUTPUTSERVICE, IFloatOutputService::BuildFloatOutputService);
			serviceBuilder->Register(BUILDER_ISTEPPEROUTPUTSERVICE, IStepperOutputService::BuildStepperOutputService);
		}
	};
}
#endif
