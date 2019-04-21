#include "Service/IOServicesServiceBuilderRegister.h"

#ifdef IOSERVICESSERVICEBUILDEREGISTER_H
namespace Service
{
	void IOServicesServiceBuilderRegister::Register(ServiceBuilder *&serviceBuilder)
	{
		serviceBuilder->Register(BUILDER_IBOOLEANINPUTSERVICE, IBooleanInputService::BuildBooleanInputService);
		serviceBuilder->Register(BUILDER_IBOOLEANOUTPUTSERVICE, IBooleanOutputService::BuildBooleanOutputService);
		serviceBuilder->Register(BUILDER_IBUTTONSERVICE, IButtonService::BuildButtonService);
		serviceBuilder->Register(BUILDER_IFLOATINPUTSERVICE, IFloatInputService::BuildFloatInputService);
		serviceBuilder->Register(BUILDER_IFLOATOUTPUTSERVICE, IFloatOutputService::BuildFloatOutputService);
		serviceBuilder->Register(BUILDER_ISTEPPEROUTPUTSERVICE, IStepperOutputService::BuildStepperOutputService);
	}
}
#endif
