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
#define BUILDER_IBOOLEANINPUTSERVICE 2001
#define BUILDER_IBUTTONSERVICE 2002
#define BUILDER_IFLOATINPUTSERVICE 2003
#define BUILDER_IBOOLEANOUTPUTSERVICE 3001
#define BUILDER_IFLOATOUTPUTSERVICE 3002
#define BUILDER_ISTEPPEROUTPUTSERVICE 3003
namespace Service
{
	class IOServicesServiceBuilderRegister
	{
	public:
		static void Register(ServiceBuilder *&serviceBuilder);
	};
}
#endif
