#include "Operations/Operation.h"
#include "Operation_EnginePosition.h"
#include "ServiceRegistry.h"
#include "Operations/OperationFactory.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEINJECTION_H
#define OPERATION_ENGINESCHEDULEINJECTION_H
namespace EFIGenie
{
	//// Used to set the direction of a pin during initialization
	enum Operation_EngineScheduleInjection_InjectAt : uint8_t
	{
		Begin = 0,
		Middle = 1,
		End = 2
	};

	class Operation_EngineScheduleInjection : public OperationArchitecture::Operation<std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t>, EnginePosition, bool, float, float>
	{
	protected:
		EmbeddedIOServices::ITimerService * const _timerService;
		OperationArchitecture::AbstractOperation * const _operation;
		const float _tdc;
		const Operation_EngineScheduleInjection_InjectAt _injectAt;

		EmbeddedIOServices::Task *_openTask;
		EmbeddedIOServices::Task *_closeTask;
		volatile EmbeddedIOServices::tick_t _lastOpenTick = 0;
		volatile bool _open = false;
	public:		
        Operation_EngineScheduleInjection(EmbeddedIOServices::ITimerService * const timerService, OperationArchitecture::AbstractOperation * const operation, const float _tdc, const Operation_EngineScheduleInjection_InjectAt injectAt);
		~Operation_EngineScheduleInjection();

		std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t> Execute(EnginePosition enginePosition, bool enable, float injectionPulseWidth, float injectionPosition) override;
		void Open();
		void Close();

		static OperationArchitecture::AbstractOperation *Create(const void *config, size_t &sizeOut, const EmbeddedIOOperations::ServiceRegistry *serviceRegistry, OperationArchitecture::OperationFactory *factory);
	};
}
#endif