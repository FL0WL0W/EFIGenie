#include "Variable.h"
#include "GeneratorMap.h"
#include "ICommunicationService.h"
#include "CommunicationHandlers/CommunicationHandler_GetVariable.h"
#include "CommunicationHandler_Prefix.h"
#include "ITimerService.h"
#include <map>
#include <list>

#ifndef COMMUNICATIONHANDLER_EFIGENIE_H
#define COMMUNICATIONHANDLER_EFIGENIE_H
#define METADATA_VARIABLEID 4294967295
namespace EFIGenie
{	
	typedef std::function<bool(void *destination, const void *data, size_t length)> communicationhandler_efigenie_write_t;
	typedef std::function<bool()> communicationhandler_quit_t;
	typedef std::function<bool()> communicationhandler_start_t;

	class CommunicationHandler_EFIGenie: public EmbeddedIOServices::CommunicationHandler_Prefix
	{
	protected:
		EmbeddedIOOperations::CommunicationHandler_GetVariable _getVariableHandler;
		std::map<EmbeddedIOServices::ICommunicationService *, std::map<EmbeddedIOServices::tick_t, std::list<uint32_t>>> _subscriptions;
		std::map<EmbeddedIOServices::ICommunicationService *, std::map<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t>> _subscriptionsLastSentTick;

		EmbeddedIOServices::ITimerService *_timerService;
	public:
		CommunicationHandler_EFIGenie(OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap, 
			EmbeddedIOServices::ITimerService *timerService,
			communicationhandler_efigenie_write_t writeCallback, 
			communicationhandler_quit_t quitCallback, 
			communicationhandler_start_t startCallback,
			const void *config);
		~CommunicationHandler_EFIGenie();

		void SendSubscriptions();
	};
}
#endif