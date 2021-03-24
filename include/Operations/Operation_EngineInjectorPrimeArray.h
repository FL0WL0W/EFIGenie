#include "Operations/IOperation.h"
#include "Operations/Operation_EngineInjectorPrime.h"
#include "ICallBack.h"

#ifndef OPERATION_ENGINEINJECTORPRIMEARRAY_H
#define OPERATION_ENGINEINJECTORPRIMEARRAY_H
namespace OperationArchitecture
{
	class Operation_EngineInjectorPrimeArray : public IOperation<void, float>
	{
	protected:
		uint8_t _length;
		Operation_EngineInjectorPrime **_primes;
	public:		
        Operation_EngineInjectorPrimeArray(EmbeddedIOServices::ITimerService *timerService, uint8_t length, EmbeddedIOServices::ICallBack **openCallBacks, EmbeddedIOServices::ICallBack **closeCallBacks);

		void Execute(float time) override;

		static IOperationBase *Create(const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif