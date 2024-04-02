#include "Variable.h"
#include "GeneratorMap.h"
#include "ICommunicationService.h"
#include "CommunicationHandlers/CommunicationHandler_GetVariable.h"
#include "CommunicationHandler_Prefix.h"

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
		EmbeddedIOOperations::CommunicationHandler_GetVariable *_getVariableHandler;
	public:
		CommunicationHandler_EFIGenie(OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap, 
			communicationhandler_efigenie_write_t writeCallback, 
			communicationhandler_quit_t quitCallback, 
			communicationhandler_start_t startCallback,
			const void *config,
			const void *metadata);
		~CommunicationHandler_EFIGenie();
	};
}
#endif