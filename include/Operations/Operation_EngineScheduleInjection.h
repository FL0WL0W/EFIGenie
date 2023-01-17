#include "Operations/Operation.h"
#include "Operation_EnginePosition.h"
#include "EmbeddedIOServiceCollection.h"
#include "Operations/OperationFactory.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEINJECTION_H
#define OPERATION_ENGINESCHEDULEINJECTION_H
namespace EFIGenie
{
	class Operation_EngineScheduleInjection : public OperationArchitecture::Operation<std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t>, EnginePosition, bool, float, float>
	{
	protected:
		EmbeddedIOServices::ITimerService * const _timerService;
		const float _tdc;
		const EmbeddedIOServices::callback_t _openCallBack;
		const EmbeddedIOServices::callback_t _closeCallBack;

		EmbeddedIOServices::Task *_openTask;
		EmbeddedIOServices::Task *_closeTask;
		volatile EmbeddedIOServices::tick_t _lastOpenTick = 0;
		bool _open = false;
	public:		
        Operation_EngineScheduleInjection(EmbeddedIOServices::ITimerService * const timerService, const float _tdc, const EmbeddedIOServices::callback_t openCallBack, const EmbeddedIOServices::callback_t closeCallBack);
		~Operation_EngineScheduleInjection();

		std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t> Execute(EnginePosition enginePosition, bool enable, float injectionPulseWidth, float injectionEndPosition) override;
		void Open();
		void Close();

		static OperationArchitecture::AbstractOperation *Create(const void *config, size_t &sizeOut, const EmbeddedIOOperations::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationArchitecture::OperationFactory *factory);
	};
}
#endif