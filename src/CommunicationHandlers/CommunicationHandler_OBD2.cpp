#include "CommunicationHandlers/CommunicationHandler_OBD2.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;

#ifdef COMMUNICATIONHANDLER_OBD2_H
namespace EFIGenie
{	
		CommunicationHandler_OBD2::CommunicationHandler_OBD2(ICommunicationService *communicationService, SystemBus *systemBus, const OBD2VariableMap *variableMap) :
			_communicationService(communicationService),
			_systemBus(systemBus),
			_variableMap(variableMap)
		{
			_communicationHandler = new CommunicationHandler([this](void *data, size_t length) { return this->Receive(data, length); });
			_communicationService->RegisterHandler(_communicationHandler);
		}

		CommunicationHandler_OBD2::~CommunicationHandler_OBD2()
		{
			_communicationService->UnRegisterHandler(_communicationHandler);
			delete _communicationHandler;
		}

		size_t CommunicationHandler_OBD2::Receive(void *data, size_t length)
		{
			uint8_t service = *reinterpret_cast<uint8_t *>(data);
			data = reinterpret_cast<uint8_t *>(data) + 1;

			switch(service)
			{
				case 1:
				{
					uint8_t pid = *reinterpret_cast<uint8_t *>(data);
					data = reinterpret_cast<uint8_t *>(data) + 1;
					switch(pid)
					{
						case 5:
						{
      						std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->EngineCoolantTempID);
							if(it != _systemBus->Variables.end())
							{
								uint8_t ect = (*it->second + 40).To<uint8_t>();
								_communicationService->Send(&ect, 1);
								return 2;
							}
						}
					}
				}
			}

			return 0;
		}
}
#endif